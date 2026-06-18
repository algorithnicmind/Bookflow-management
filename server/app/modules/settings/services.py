from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.settings.models import SystemSetting, PublicHoliday
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

    async def get_leave_policies(self):
        from app.modules.settings.models import LeavePolicy
        result = await self.db.execute(select(LeavePolicy))
        return result.scalars().all()

    async def create_leave_policy(self, data):
        from app.modules.settings.models import LeavePolicy
        policy = LeavePolicy(
            name=data.name,
            department=data.department,
            role=data.role,
            leave_type=data.leave_type,
            base_days=data.base_days,
            accrual_rate=data.accrual_rate,
            max_carry_forward=data.max_carry_forward
        )
        self.db.add(policy)
        await self.db.commit()
        await self.db.refresh(policy)
        return policy

    async def delete_leave_policy(self, policy_id: int):
        from app.modules.settings.models import LeavePolicy
        result = await self.db.execute(select(LeavePolicy).where(LeavePolicy.id == policy_id))
        policy = result.scalar_one_or_none()
        if policy:
            await self.db.delete(policy)
            await self.db.commit()

    async def get_holidays(self):
        result = await self.db.execute(select(PublicHoliday).order_by(PublicHoliday.date))
        return result.scalars().all()

    async def create_holiday(self, data):
        holiday = PublicHoliday(name=data.name, date=data.date, region=data.region)
        self.db.add(holiday)
        await self.db.commit()
        await self.db.refresh(holiday)
        return holiday

    async def delete_holiday(self, holiday_id: int):
        result = await self.db.execute(select(PublicHoliday).where(PublicHoliday.id == holiday_id))
        holiday = result.scalar_one_or_none()
        if holiday:
            await self.db.delete(holiday)
            await self.db.commit()

    async def get_approval_chains(self):
        from sqlalchemy.orm import selectinload
        from app.modules.settings.models import ApprovalChain
        result = await self.db.execute(select(ApprovalChain).options(selectinload(ApprovalChain.steps)))
        return result.scalars().all()

    async def create_approval_chain(self, data):
        from app.modules.settings.models import ApprovalChain, ApprovalStep
        chain = ApprovalChain(department=data.department)
        self.db.add(chain)
        await self.db.flush()
        
        for step in data.steps:
            db_step = ApprovalStep(chain_id=chain.id, step_order=step.step_order, role_required=step.role_required)
            self.db.add(db_step)
            
        await self.db.commit()
        await self.db.refresh(chain)
        return chain

    async def delete_approval_chain(self, chain_id: int):
        from app.modules.settings.models import ApprovalChain
        result = await self.db.execute(select(ApprovalChain).where(ApprovalChain.id == chain_id))
        chain = result.scalar_one_or_none()
        if chain:
            await self.db.delete(chain)
            await self.db.commit()
