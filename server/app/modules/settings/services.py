from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.settings.models import SystemSetting
from app.modules.settings.schemas import SettingsUpdate
from app.modules.audit.services import AuditLogService

class SettingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_settings(self) -> SystemSetting:
        result = await self.db.execute(select(SystemSetting))
        settings = result.scalar_one_or_none()
        if not settings:
            settings = SystemSetting()
            self.db.add(settings)
            await self.db.commit()
            await self.db.refresh(settings)
        return settings

    async def update_settings(self, data: SettingsUpdate, actor_id: Optional[int] = None) -> dict:
        settings = await self.get_settings()
        
        # Capture old settings state for audit logs
        old_settings = {
            "max_casual_leave": settings.max_casual_leave,
            "max_sick_leave": settings.max_sick_leave,
            "max_earned_leave": settings.max_earned_leave,
            "max_maternity_leave": settings.max_maternity_leave,
            "max_miscarriage_leave": settings.max_miscarriage_leave
        }
        
        if data.max_casual_leave is not None:
            settings.max_casual_leave = data.max_casual_leave
        if data.max_sick_leave is not None:
            settings.max_sick_leave = data.max_sick_leave
        if data.max_earned_leave is not None:
            settings.max_earned_leave = data.max_earned_leave
        if data.max_maternity_leave is not None:
            settings.max_maternity_leave = data.max_maternity_leave
        if data.max_miscarriage_leave is not None:
            settings.max_miscarriage_leave = data.max_miscarriage_leave
            
        new_settings = {
            "max_casual_leave": settings.max_casual_leave,
            "max_sick_leave": settings.max_sick_leave,
            "max_earned_leave": settings.max_earned_leave,
            "max_maternity_leave": settings.max_maternity_leave,
            "max_miscarriage_leave": settings.max_miscarriage_leave
        }
        
        # Log system setting audit trail
        await AuditLogService.log_action(
            db=self.db,
            actor_id=actor_id,
            action="settings_update",
            target_type="system_settings",
            target_id=str(settings.id),
            details={"old": old_settings, "new": new_settings}
        )
        
        await self.db.commit()
        return {"message": "Settings updated successfully"}
