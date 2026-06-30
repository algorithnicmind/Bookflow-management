from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from app.modules.employees.models import Employee, PlatformOwner, EmployeeImage
from app.modules.organizations.models import OnboardingApplication

class AuthRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_employee_by_email(self, email: str) -> Optional[Employee]:
        result = await self.db.execute(select(Employee).where(Employee.email == email))
        return result.scalar_one_or_none()

    async def get_employee_by_id(self, emp_id: int) -> Optional[Employee]:
        return await self.db.get(Employee, emp_id)
        
    async def get_active_super_admin_by_org(self, org_id: int) -> Optional[Employee]:
        res = await self.db.execute(select(Employee).where(
            (Employee.organization_id == org_id) & 
            (Employee.role == "super_admin") &
            (Employee.is_active == True)
        ))
        return res.scalars().first()
        
    async def get_active_employee_by_id(self, emp_id: int) -> Optional[Employee]:
        res = await self.db.execute(select(Employee).where(
            (Employee.id == emp_id) & 
            (Employee.is_active == True)
        ))
        return res.scalars().first()

    async def get_platform_owner_by_email(self, email: str) -> Optional[PlatformOwner]:
        result = await self.db.execute(select(PlatformOwner).where(PlatformOwner.email == email))
        return result.scalar_one_or_none()

    async def get_platform_owner_by_id(self, po_id: int) -> Optional[PlatformOwner]:
        return await self.db.get(PlatformOwner, po_id)

    async def get_pending_application_by_email(self, email: str) -> Optional[OnboardingApplication]:
        result = await self.db.execute(select(OnboardingApplication).where(OnboardingApplication.super_admin_email == email))
        return result.scalar_one_or_none()
        
    async def add_employee(self, employee: Employee) -> Employee:
        self.db.add(employee)
        await self.db.flush()
        return employee
        
    async def add_employee_image(self, image: EmployeeImage) -> EmployeeImage:
        self.db.add(image)
        await self.db.flush()
        return image
        
    async def commit(self):
        await self.db.commit()
