from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import RoleChecker
from app.modules.employees.models import Employee
from app.modules.settings.schemas import SettingsUpdate
from app.modules.settings.services import SettingsService

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.put("")
async def update_settings(
    request: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin"]))
):
    service = SettingsService(db)
    return await service.update_settings(request)

@router.get("")
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin"]))
):
    service = SettingsService(db)
    settings = await service.get_settings()
    return {
        "max_casual_leave": settings.max_casual_leave,
        "max_sick_leave": settings.max_sick_leave,
        "max_earned_leave": settings.max_earned_leave,
        "max_maternity_leave": settings.max_maternity_leave,
        "max_miscarriage_leave": settings.max_miscarriage_leave,
    }
