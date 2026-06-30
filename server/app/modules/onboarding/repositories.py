from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func as sql_func, delete
from typing import Optional
from app.modules.organizations.models import OnboardingApplication, Organization
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveBalance

class OnboardingRepository:
    async def get_by_email(self, email: str, db: AsyncSession) -> Optional[OnboardingApplication]:
        result = await db.execute(
            select(OnboardingApplication).where(OnboardingApplication.super_admin_email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, application_id: int, db: AsyncSession) -> Optional[OnboardingApplication]:
        result = await db.execute(
            select(OnboardingApplication).where(OnboardingApplication.id == application_id)
        )
        return result.scalar_one_or_none()

    async def create(self, app_data: OnboardingApplication, db: AsyncSession) -> OnboardingApplication:
        db.add(app_data)
        await db.commit()
        await db.refresh(app_data)
        return app_data

    async def list_applications(self, status_filter: Optional[str], db: AsyncSession):
        query = (
            select(OnboardingApplication)
            .order_by(OnboardingApplication.created_at.desc())
        )

        if status_filter:
            query = query.where(OnboardingApplication.status == status_filter)

        result = await db.execute(query)
        return result.scalars().all()

    async def get_counts(self, db: AsyncSession):
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
        return count_result.one()

    async def get_employee_by_email(self, email: str, db: AsyncSession) -> Optional[Employee]:
        result = await db.execute(select(Employee).where(Employee.email == email))
        return result.scalar_one_or_none()

    async def get_org_by_id(self, org_id: int, db: AsyncSession) -> Optional[Organization]:
        result = await db.execute(select(Organization).where(Organization.id == org_id))
        return result.scalar_one_or_none()

    async def delete_tenant_data(self, org_id: int, application_id: int, db: AsyncSession):
        await db.execute(delete(LeaveRequest).where(LeaveRequest.organization_id == org_id))
        await db.execute(delete(LeaveBalance).where(LeaveBalance.organization_id == org_id))
        await db.execute(delete(Employee).where(Employee.organization_id == org_id))
        await db.execute(delete(Organization).where(Organization.id == org_id))
        await db.execute(delete(OnboardingApplication).where(OnboardingApplication.id == application_id))
        await db.commit()
