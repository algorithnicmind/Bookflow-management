from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.settings.models import SystemSetting
from app.modules.settings.schemas import SettingsUpdate

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

    async def update_settings(self, data: SettingsUpdate) -> dict:
        settings = await self.get_settings()
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
        await self.db.commit()
        return {"message": "Settings updated successfully"}
