"""
Onboarding API Routes
---------------------
Manages new organization signups. Platform Owners use this to review and approve incoming leads,
which triggers the automatic creation of their tenant database schema and first admin account.
"""
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.dependencies import RequireOwner
from app.modules.employees.models import Employee
from app.modules.onboarding.services import OnboardingService

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
    service = OnboardingService()
    return await service.submit_application(request, db)

# ─── Admin Endpoints (super_admin only) ───────────────────────────────────────

@router.get("/applications")
async def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """List all onboarding applications, optionally filtered by status."""
    service = OnboardingService()
    return await service.list_applications(status_filter, db)


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
    service = OnboardingService()
    return await service.update_status(application_id, body.status, db)


@router.get("/applications/{application_id}")
async def get_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Get a single onboarding application by ID (Platform Owner only)."""
    service = OnboardingService()
    return await service.get_application(application_id, db)


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
    service = OnboardingService()
    return await service.update_notes(application_id, body.notes, db)


class UpdatePlanRequest(BaseModel):
    selected_plan: str

@router.patch("/applications/{application_id}/plan")
async def update_application_plan(
    application_id: int,
    body: UpdatePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Update the selected plan for an onboarding application (Platform Owner only)."""
    service = OnboardingService()
    return await service.update_plan(application_id, body.selected_plan, db)


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
    service = OnboardingService()
    return await service.approve_application(application_id, body, db)


@router.delete("/applications/{application_id}/tenant")
async def delete_tenant(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Completely delete an onboarding application and its associated Organization and Super Admin if provisioned."""
    service = OnboardingService()
    return await service.delete_tenant(application_id, db)


@router.put("/applications/{application_id}/reject")
async def reject_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Reject a pending application."""
    service = OnboardingService()
    return await service.reject_application(application_id, db)
