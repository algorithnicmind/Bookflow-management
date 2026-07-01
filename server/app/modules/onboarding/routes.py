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
    """
    Submit a New Onboarding Application (Lead).
    Publicly accessible endpoint used by the frontend landing page.
    Saves the lead data into the database with a 'pending' status for review.
    """
    service = OnboardingService()
    return await service.submit_application(request, db)

# ─── Admin Endpoints (super_admin only) ───────────────────────────────────────
# The following endpoints require the 'RequireOwner' dependency, meaning only
# users in the 'System' department (Platform Owners) can access them.

@router.get("/applications")
async def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """
    List all onboarding applications.
    Optionally filterable by their current pipeline status (e.g., 'pending', 'approved', 'rejected').
    """
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
    """
    Update the sales pipeline status of an onboarding application (e.g., from 'pending' to 'contacted').
    """
    service = OnboardingService()
    return await service.update_status(application_id, body.status, db)


@router.get("/applications/{application_id}")
async def get_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """
    Fetch the detailed view of a single onboarding application.
    Used when a Platform Owner clicks into a specific lead card on the CRM board.
    """
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
    """
    Update internal CRM notes for a lead.
    These notes are strictly internal and only visible to Platform Owners.
    """
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
    """
    Change the selected subscription plan for an onboarding application.
    Useful if a lead negotiates a different tier before approval.
    """
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
    """
    Approve a pending application and provision the tenant.
    This critical endpoint triggers:
    1. Organization creation in the database.
    2. Super Admin employee account creation.
    3. Default leave balances generation.
    4. Status update of the application to 'approved'.
    """
    service = OnboardingService()
    return await service.approve_application(application_id, body, db)


@router.delete("/applications/{application_id}/tenant")
async def delete_tenant(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """
    Completely delete an onboarding application.
    If the application was already approved and provisioned, this ALSO deletes 
    the associated Organization and Super Admin data.
    """
    service = OnboardingService()
    return await service.delete_tenant(application_id, db)


@router.put("/applications/{application_id}/reject")
async def reject_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """
    Reject a pending application.
    Updates the status to 'rejected' without provisioning any tenant resources.
    """
    service = OnboardingService()
    return await service.reject_application(application_id, db)
