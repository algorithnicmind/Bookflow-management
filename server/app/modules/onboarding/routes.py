"""
Onboarding API Routes
---------------------
Manages new organization signups. Platform Owners use this to review and approve incoming leads,
which triggers the automatic creation of their tenant database schema and first admin account.
"""
from datetime import datetime
import asyncio
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func as sql_func, delete
from app.core.database import get_db
from app.core.dependencies import RequireOwner
from app.core.security import pwd_context
from app.modules.organizations.models import Organization, OnboardingApplication
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance, LeaveRequest
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

class ApplicationRequest(BaseModel):
    company_name: str
    company_size: str
    super_admin_name: str
    super_admin_email: EmailStr
    super_admin_phone: Optional[str] = None
    industry: str
    admin_password: Optional[str] = None
    special_requirements: str | None = None
    selected_plan: Optional[str] = "free_trial"

class ApplicationResponse(BaseModel):
    id: int
    company_name: str
    super_admin_name: str
    super_admin_email: str
    super_admin_phone: Optional[str] = None
    industry: str
    status: str
    message: str

@router.post("/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(request: ApplicationRequest, db: AsyncSession = Depends(get_db)):
    # Check if application already exists
    result = await db.execute(select(OnboardingApplication).where(OnboardingApplication.super_admin_email == request.super_admin_email))
    existing_app = result.scalar_one_or_none()
    
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An application for this email already exists."
        )

    # Create new application
    password_hash = None
    if request.admin_password:
        password_hash = await asyncio.to_thread(pwd_context.hash, request.admin_password)

    new_app = OnboardingApplication(
        company_name=request.company_name,
        company_size=request.company_size,
        super_admin_name=request.super_admin_name,
        super_admin_email=request.super_admin_email,
        super_admin_phone=request.super_admin_phone,
        industry=request.industry,
        super_admin_password_hash=password_hash,
        special_requirements=request.special_requirements,
        selected_plan=request.selected_plan or "free_trial",
        status="pending"
    )
    
    db.add(new_app)
    await db.commit()
    await db.refresh(new_app)
    
    return {
        "id": new_app.id,
        "company_name": new_app.company_name,
        "super_admin_name": new_app.super_admin_name,
        "super_admin_email": new_app.super_admin_email,
        "super_admin_phone": new_app.super_admin_phone,
        "industry": new_app.industry,
        "selected_plan": new_app.selected_plan,
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
    query = (
        select(OnboardingApplication)
        .order_by(OnboardingApplication.created_at.desc())
    )

    if status_filter and status_filter in ("pending", "contacted", "connected", "interested", "not_interested"):
        query = query.where(OnboardingApplication.status == status_filter)

    result = await db.execute(query)
    applications = result.scalars().all()

    # Compute summary counts
    count_result = await db.execute(
        select(
            sql_func.count(OnboardingApplication.id).label("total"),
            sql_func.count(OnboardingApplication.id).filter(OnboardingApplication.status == "pending").label("pending"),
            sql_func.count(OnboardingApplication.id).filter(OnboardingApplication.status == "contacted").label("contacted"),
            sql_func.count(OnboardingApplication.id).filter(OnboardingApplication.status == "connected").label("connected"),
            sql_func.count(OnboardingApplication.id).filter(OnboardingApplication.status == "interested").label("interested"),
            sql_func.count(OnboardingApplication.id).filter(OnboardingApplication.status == "not_interested").label("not_interested"),
        )
    )
    counts = count_result.one()

    return {
        "applications": [
            {
                "id": app.id,
                "company_name": app.company_name,
                "company_size": app.company_size,
                "super_admin_name": app.super_admin_name,
                "super_admin_email": app.super_admin_email,
                "super_admin_phone": app.super_admin_phone,
                "industry": app.industry,
                "special_requirements": app.special_requirements,
                "selected_plan": app.selected_plan or "free_trial",
                "status": app.status,
                "internal_notes": app.internal_notes,
                "organization_id": app.organization_id,
                "created_at": app.created_at.isoformat() if app.created_at else None,
            }
            for app in applications
        ],
        "counts": {
            "total": counts.total,
            "pending": counts.pending,
            "contacted": counts.contacted,
            "connected": counts.connected,
            "interested": counts.interested,
            "not_interested": counts.not_interested,
        },
    }


VALID_LEAD_STATUSES = ["pending", "contacted", "connected", "interested", "not_interested"]


class UpdateStatusRequest(BaseModel):
    status: str


@router.patch("/applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    body: UpdateStatusRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Update the status of an onboarding application (Platform Owner only)."""

    if body.status not in VALID_LEAD_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{body.status}'. Must be one of: {', '.join(VALID_LEAD_STATUSES)}",
        )

    result = await db.execute(
        select(OnboardingApplication).where(OnboardingApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    application.status = body.status
    await db.commit()

    return {"message": f"Status updated to '{body.status}'.", "id": application.id, "status": body.status}


@router.get("/applications/{application_id}")
async def get_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Get a single onboarding application by ID (Platform Owner only)."""
    app_result = await db.execute(
        select(OnboardingApplication)
        .where(OnboardingApplication.id == application_id)
    )
    application = app_result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    org = None
    if application.organization_id:
        org_result = await db.execute(
            select(Organization).where(Organization.id == application.organization_id)
        )
        org = org_result.scalar_one_or_none()

    emp = None
    emp_result = await db.execute(
        select(Employee).where(Employee.email == application.super_admin_email)
    )
    emp = emp_result.scalar_one_or_none()

    expires_at = org.expires_at.isoformat() if org and org.expires_at else None

    return {
        "id": application.id,
        "company_name": application.company_name,
        "company_size": application.company_size,
        "super_admin_name": emp.name if emp else application.super_admin_name,
        "super_admin_email": emp.email if emp else application.super_admin_email,
        "admin_role": emp.role if emp else None,
        "super_admin_phone": application.super_admin_phone,
        "industry": application.industry,
        "special_requirements": application.special_requirements,
        "selected_plan": application.selected_plan or "free_trial",
        "status": application.status,
        "internal_notes": application.internal_notes,
        "organization_id": application.organization_id,
        "created_at": application.created_at.isoformat() if application.created_at else None,
        "expires_at": expires_at,
    }





class UpdateNotesRequest(BaseModel):
    notes: str


@router.patch("/applications/{application_id}/notes")
async def update_application_notes(
    application_id: int,
    body: UpdateNotesRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Update internal CRM notes for a lead (Platform Owner only)."""
    result = await db.execute(
        select(OnboardingApplication).where(OnboardingApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    application.internal_notes = body.notes
    await db.commit()

    return {"message": "Notes updated successfully.", "id": application.id}


class UpdatePlanRequest(BaseModel):
    selected_plan: str


VALID_PLAN_OPTIONS = ["free_trial", "professional", "enterprise"]


@router.patch("/applications/{application_id}/plan")
async def update_application_plan(
    application_id: int,
    body: UpdatePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Update the selected plan for an onboarding application (Platform Owner only)."""

    if body.selected_plan not in VALID_PLAN_OPTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid plan '{body.selected_plan}'. Must be one of: {', '.join(VALID_PLAN_OPTIONS)}",
        )

    result = await db.execute(
        select(OnboardingApplication).where(OnboardingApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    application.selected_plan = body.selected_plan
    await db.commit()

    return {"message": f"Plan updated to '{body.selected_plan}'.", "id": application.id, "selected_plan": application.selected_plan}


class ApproveApplicationRequest(BaseModel):
    password: Optional[str] = None
    access_days: Optional[int] = 30
    internal_notes: Optional[str] = None


@router.put("/applications/{application_id}/approve")
async def approve_application(
    application_id: int,
    body: Optional[ApproveApplicationRequest] = None,
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

    if application.status == "rejected":
        raise HTTPException(status_code=400, detail="Application was already rejected. Cannot provision a rejected application.")

    if application.status == "not_interested":
        raise HTTPException(status_code=400, detail="Cannot provision an application marked as 'not interested'. Update the status first.")

    # We do NOT set application.status = "approved". It remains whatever it is (e.g. connected).
    
    if body and body.internal_notes is not None:
        application.internal_notes = body.internal_notes

    from datetime import timedelta
    access_days_val = 30
    if body and body.access_days is not None:
        access_days_val = body.access_days
    expires_at_val = datetime.utcnow() + timedelta(days=access_days_val)

    # UPSERT LOGIC: Check if admin employee already exists
    emp_result = await db.execute(select(Employee).where(Employee.email == application.super_admin_email))
    existing_admin = emp_result.scalar_one_or_none()

    if existing_admin:
        # Organization already exists, so update it
        org_result = await db.execute(select(Organization).where(Organization.id == existing_admin.organization_id))
        org = org_result.scalar_one_or_none()
        
        if org:
            org.access_days = access_days_val
            org.expires_at = expires_at_val
            application.organization_id = org.id
            if body and body.password:
                existing_admin.password_hash = await asyncio.to_thread(pwd_context.hash, body.password)
                
            await db.commit()
            return {
                "message": f"Tenant '{org.name}' configuration updated successfully.",
                "organization": {"id": org.id, "name": org.name},
                "admin": {"id": existing_admin.id, "email": existing_admin.email},
            }

    import re
    base_slug = re.sub(r'[^a-z0-9]+', '-', application.company_name.lower()).strip('-')
    domain = f"{base_slug}-{application.id}.leaveflow.com"
    
    access_days_val = 30
    if body and body.access_days is not None:
        access_days_val = body.access_days
        
    from datetime import timedelta
    expires_at_val = datetime.utcnow() + timedelta(days=access_days_val)

    org = Organization(
        name=application.company_name,
        domain=domain,
        plan_type="enterprise",
        is_active=True,
        access_days=access_days_val,
        expires_at=expires_at_val,
    )
    db.add(org)
    await db.flush()  # flush to get org.id
    application.organization_id = org.id

    # 4. Create Employee (super_admin)
    password_hash = None
    if body and body.password:
        password_hash = await asyncio.to_thread(pwd_context.hash, body.password)
    elif application.super_admin_password_hash:
        password_hash = application.super_admin_password_hash
        
    if not password_hash:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve: no password set. Please provide a password in the request or ensure the lead has one."
        )

    admin_employee = Employee(
        organization_id=org.id,
        name=application.super_admin_name or "Admin User",
        email=application.super_admin_email,
        password_hash=password_hash,
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
        "message": f"Tenant '{org.name}' provisioned successfully.",
        "organization": {"id": org.id, "name": org.name},
        "admin": {"id": admin_employee.id, "email": admin_employee.email},
    }

@router.delete("/applications/{application_id}/tenant")
async def delete_tenant(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Completely delete an onboarding application and its associated Organization and Super Admin if provisioned."""
    result = await db.execute(select(OnboardingApplication).where(OnboardingApplication.id == application_id))
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check if an organization was provisioned
    emp_result = await db.execute(select(Employee).where(Employee.email == app.super_admin_email))
    admin_emp = emp_result.scalar_one_or_none()
    
    if admin_emp:
            org_id = admin_emp.organization_id
            
            # Delete related data to maintain integrity
            await db.execute(delete(LeaveRequest).where(LeaveRequest.organization_id == org_id))
            await db.execute(delete(LeaveBalance).where(LeaveBalance.organization_id == org_id))
            await db.execute(delete(Employee).where(Employee.organization_id == org_id))
            await db.execute(delete(Organization).where(Organization.id == org_id))

    # Delete the application itself
    await db.execute(delete(OnboardingApplication).where(OnboardingApplication.id == application_id))
    await db.commit()

    return {"message": "Tenant and application successfully deleted."}


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
