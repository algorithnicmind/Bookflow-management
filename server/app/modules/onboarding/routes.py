"""
Onboarding API Routes
---------------------
Manages new organization signups. Platform Owners use this to review and approve incoming leads,
which triggers the automatic creation of their tenant database schema and first admin account.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func as sql_func
from app.core.database import get_db
from app.core.dependencies import RoleChecker, RequireOwner
from app.core.security import pwd_context
from app.modules.organizations.models import Organization, OnboardingApplication
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

class ApplicationRequest(BaseModel):
    company_name: str
    company_size: str
    admin_name: str
    admin_email: EmailStr
    industry: str
    admin_password: Optional[str] = None
    special_requirements: str | None = None

class ApplicationResponse(BaseModel):
    id: int
    company_name: str
    admin_name: str
    admin_email: str
    industry: str
    status: str
    message: str

@router.post("/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(request: ApplicationRequest, db: AsyncSession = Depends(get_db)):
    # Check if application already exists
    result = await db.execute(select(OnboardingApplication).where(OnboardingApplication.admin_email == request.admin_email))
    existing_app = result.scalar_one_or_none()
    
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An application for this email already exists."
        )

    # Create new application
    password_hash = None
    if request.admin_password:
        password_hash = pwd_context.hash(request.admin_password)

    new_app = OnboardingApplication(
        company_name=request.company_name,
        company_size=request.company_size,
        admin_name=request.admin_name,
        admin_email=request.admin_email,
        industry=request.industry,
        admin_password_hash=password_hash,
        special_requirements=request.special_requirements,
        status="pending"
    )
    
    db.add(new_app)
    await db.commit()
    await db.refresh(new_app)
    
    return {
        "id": new_app.id,
        "company_name": new_app.company_name,
        "admin_name": new_app.admin_name,
        "admin_email": new_app.admin_email,
        "industry": new_app.industry,
        "status": new_app.status,
        "message": "Application submitted successfully. Our team will contact you shortly."
    }


# ─── Admin Endpoints (super_admin only) ───────────────────────────────────────


@router.get("/applications")
async def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """List all onboarding applications, optionally filtered by status."""
    query = select(OnboardingApplication).order_by(OnboardingApplication.created_at.desc())

    if status_filter and status_filter in ("pending", "approved", "rejected"):
        query = query.where(OnboardingApplication.status == status_filter)

    result = await db.execute(query)
    applications = result.scalars().all()

    # Compute summary counts
    count_result = await db.execute(
        select(
            sql_func.count(OnboardingApplication.id).label("total"),
            sql_func.count(OnboardingApplication.id).filter(OnboardingApplication.status == "pending").label("pending"),
            sql_func.count(OnboardingApplication.id).filter(OnboardingApplication.status == "approved").label("approved"),
            sql_func.count(OnboardingApplication.id).filter(OnboardingApplication.status == "rejected").label("rejected"),
        )
    )
    counts = count_result.one()

    return {
        "applications": [
            {
                "id": app.id,
                "company_name": app.company_name,
                "company_size": app.company_size,
                "admin_name": app.admin_name,
                "admin_email": app.admin_email,
                "industry": app.industry,
                "special_requirements": app.special_requirements,
                "status": app.status,
                "created_at": app.created_at.isoformat() if app.created_at else None,
            }
            for app in applications
        ],
        "counts": {
            "total": counts.total,
            "pending": counts.pending,
            "approved": counts.approved,
            "rejected": counts.rejected,
        },
    }


@router.put("/applications/{application_id}/approve")
async def approve_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Approve a pending application: create Organization + Super Admin + Leave Balances."""

    # 1. Find the application
    result = await db.execute(
        select(OnboardingApplication).where(OnboardingApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    if application.status == "approved":
        raise HTTPException(status_code=400, detail="Application is already approved.")

    if application.status == "rejected":
        raise HTTPException(status_code=400, detail="Application was already rejected. Cannot approve a rejected application.")

    # 2. Update application status
    application.status = "approved"

    # 3. Create Organization
    domain = application.admin_email.split("@")[1] if "@" in application.admin_email else "unknown.com"
    org = Organization(
        name=application.company_name,
        domain=domain,
        plan_type="enterprise",
        is_active=True,
    )
    db.add(org)
    await db.flush()  # flush to get org.id

    # 4. Create Employee (super_admin)
    admin_employee = Employee(
        organization_id=org.id,
        name="Admin User",
        email=application.admin_email,
        password_hash=application.admin_password_hash or pwd_context.hash("Welcome123!"),
        role="super_admin",
        department="Management",
        gender="not_specified",
        is_active=True,
    )
    db.add(admin_employee)
    await db.flush()  # flush to get admin_employee.id

    # 5. Add default leave balances
    current_year = datetime.today().year
    default_balances = [
        ("casual", 12),
        ("sick", 12),
        ("earned", 18),
        ("maternity", 182),
        ("miscarriage", 42),
    ]
    for leave_type, days in default_balances:
        balance = LeaveBalance(
            organization_id=org.id,
            employee_id=admin_employee.id,
            leave_type=leave_type,
            total_days=days,
            used_days=0,
            year=current_year,
        )
        db.add(balance)

    await db.commit()

    return {
        "message": f"Application approved. Organization '{org.name}' created.",
        "organization": {"id": org.id, "name": org.name},
        "admin": {"id": admin_employee.id, "email": admin_employee.email},
    }


@router.put("/applications/{application_id}/reject")
async def reject_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Reject a pending application."""

    result = await db.execute(
        select(OnboardingApplication).where(OnboardingApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    if application.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject an application with status '{application.status}'.",
        )

    application.status = "rejected"
    await db.commit()

    return {"message": "Application rejected.", "id": application.id, "status": "rejected"}
