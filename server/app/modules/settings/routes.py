"""
System Settings API Routes
--------------------------
Handles global platform configurations, approval chains, and triggering scheduled CRON jobs like accruals.
Restricted to system administrators.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import RoleChecker, RequireOwner
from app.core.tenant import get_current_tenant
from app.modules.organizations.models import Organization
from app.modules.employees.models import Employee
from app.modules.settings.schemas import SettingsUpdate
from app.modules.settings.services import SettingsService
from app.modules.settings.models import PlatformConfig

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.put("")
async def update_settings(
    request: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin"]))
):
    service = SettingsService(db, tenant.id)
    return await service.update_settings(request, current_user.id)

from pydantic import BaseModel
class OrgNameUpdate(BaseModel):
    name: str

@router.put("/organization-name")
async def update_organization_name(
    request: OrgNameUpdate,
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin"]))
):
    tenant.name = request.name
    db.add(tenant)
    await db.commit()
    return {"message": "Organization name updated", "name": tenant.name}

@router.get("")
async def get_settings(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin"]))
):
    service = SettingsService(db, tenant.id)
    settings = await service.get_settings()
    return {
        "max_casual_leave": settings.max_casual_leave,
        "max_sick_leave": settings.max_sick_leave,
        "max_earned_leave": settings.max_earned_leave,
        "max_maternity_leave": settings.max_maternity_leave,
        "max_miscarriage_leave": settings.max_miscarriage_leave,
    }

from typing import List
from app.modules.settings.schemas import PublicHolidayCreate, PublicHolidayResponse, ApprovalChainCreate, ApprovalChainResponse, LeavePolicyCreate, LeavePolicyResponse

@router.get("/leave-policies", response_model=List[LeavePolicyResponse])
async def get_leave_policies(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    service = SettingsService(db, tenant.id)
    return await service.get_leave_policies()

@router.post("/leave-policies", response_model=LeavePolicyResponse)
async def create_leave_policy(
    request: LeavePolicyCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    service = SettingsService(db, tenant.id)
    return await service.create_leave_policy(request)

@router.delete("/leave-policies/{policy_id}")
async def delete_leave_policy(
    policy_id: int,
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    service = SettingsService(db, tenant.id)
    await service.delete_leave_policy(policy_id)
    return {"message": "Leave policy deleted"}

@router.get("/holidays", response_model=List[PublicHolidayResponse])
async def get_holidays(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin", "manager", "employee"]))
):
    service = SettingsService(db, tenant.id)
    return await service.get_holidays()

@router.post("/holidays", response_model=PublicHolidayResponse)
async def create_holiday(
    request: PublicHolidayCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    service = SettingsService(db, tenant.id)
    return await service.create_holiday(request)

@router.delete("/holidays/{holiday_id}")
async def delete_holiday(
    holiday_id: int,
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    service = SettingsService(db, tenant.id)
    await service.delete_holiday(holiday_id)
    return {"message": "Holiday deleted"}

@router.get("/approval-chains", response_model=List[ApprovalChainResponse])
async def get_approval_chains(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    service = SettingsService(db, tenant.id)
    return await service.get_approval_chains()

@router.post("/approval-chains", response_model=ApprovalChainResponse)
async def create_approval_chain(
    request: ApprovalChainCreate,
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    service = SettingsService(db, tenant.id)
    return await service.create_approval_chain(request)

@router.delete("/approval-chains/{chain_id}")
async def delete_approval_chain(
    chain_id: int,
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    service = SettingsService(db, tenant.id)
    await service.delete_approval_chain(chain_id)
    return {"message": "Approval chain deleted"}

from app.modules.leaves.cron import run_monthly_accruals, run_yearly_carry_forward

@router.post("/debug/trigger-monthly-accrual")
async def trigger_monthly_accrual(current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))):
    await run_monthly_accruals()
    return {"message": "Monthly accrual job completed"}

@router.post("/debug/trigger-yearly-carry-forward")
async def trigger_yearly_carry_forward(current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))):
    await run_yearly_carry_forward()
    return {"message": "Yearly carry forward job completed"}


# ─── Platform Config Endpoints (Public read, Owner write) ──────────────────

@router.get("/platform-config")
async def get_platform_config(db: AsyncSession = Depends(get_db)):
    """Public endpoint to get platform configuration (e.g., whether onboarding section is visible)."""
    result = await db.execute(select(PlatformConfig).limit(1))
    config = result.scalar_one_or_none()
    
    if not config:
        # Create default config
        config = PlatformConfig(show_onboarding_section=True)
        db.add(config)
        await db.commit()
        await db.refresh(config)
    
    return {
        "show_onboarding_section": config.show_onboarding_section,
        "onboarding_section_title": config.onboarding_section_title,
        "onboarding_section_subtitle": config.onboarding_section_subtitle,
    }


class PlatformConfigUpdate(BaseModel):
    show_onboarding_section: Optional[bool] = None
    onboarding_section_title: Optional[str] = None
    onboarding_section_subtitle: Optional[str] = None


@router.put("/platform-config")
async def update_platform_config(
    request: PlatformConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner),
):
    """Update platform configuration (Platform Owner only)."""
    result = await db.execute(select(PlatformConfig).limit(1))
    config = result.scalar_one_or_none()
    
    if not config:
        config = PlatformConfig(show_onboarding_section=True)
        db.add(config)
        await db.flush()
    
    if request.show_onboarding_section is not None:
        config.show_onboarding_section = request.show_onboarding_section
    if request.onboarding_section_title is not None:
        config.onboarding_section_title = request.onboarding_section_title
    if request.onboarding_section_subtitle is not None:
        config.onboarding_section_subtitle = request.onboarding_section_subtitle
    
    await db.commit()
    await db.refresh(config)
    
    return {
        "message": "Platform config updated successfully",
        "show_onboarding_section": config.show_onboarding_section,
        "onboarding_section_title": config.onboarding_section_title,
        "onboarding_section_subtitle": config.onboarding_section_subtitle,
    }
