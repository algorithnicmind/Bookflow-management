from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Optional
from app.modules.employees.models import Employee

class EmployeeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, employee_id: int) -> Optional[Employee]:
        result = await self.db.execute(select(Employee).where(Employee.id == employee_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Employee]:
        result = await self.db.execute(select(Employee).where(Employee.email == email))
        return result.scalar_one_or_none()

    async def list_employees(self, search: Optional[str] = None) -> List[Employee]:
        query = select(Employee)
        if search:
            query = query.where(
                or_(
                    Employee.name.ilike(f"%{search}%"),
                    Employee.email.ilike(f"%{search}%")
                )
            )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, employee: Employee) -> Employee:
        self.db.add(employee)
        await self.db.flush()
        return employee

    async def commit(self):
        await self.db.commit()
