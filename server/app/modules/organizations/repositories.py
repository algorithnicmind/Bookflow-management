from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.modules.organizations.models import Organization, RolePermission, Department
from app.modules.settings.models import LeaveType
from app.modules.employees.models import Employee
from app.modules.audit.models import AuditLog

class OrganizationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Organization]:
        result = await self.db.execute(select(Organization))
        return result.scalars().all()

    async def get_by_id(self, org_id: int) -> Optional[Organization]:
        return await self.db.get(Organization, org_id)

    async def update(self, org: Organization) -> Organization:
        await self.db.commit()
        await self.db.refresh(org)
        return org

    async def get_role_permissions(self, org_id: int) -> List[RolePermission]:
        result = await self.db.execute(select(RolePermission).where(RolePermission.organization_id == org_id))
        return result.scalars().all()

    async def get_role_permission(self, org_id: int, role_name: str) -> Optional[RolePermission]:
        result = await self.db.execute(select(RolePermission).where(
            (RolePermission.organization_id == org_id) &
            (RolePermission.role_name == role_name)
        ))
        return result.scalar_one_or_none()

    async def create_role_permission(self, role_perm: RolePermission):
        self.db.add(role_perm)
        await self.db.commit()
        await self.db.refresh(role_perm)
        return role_perm

    async def delete_role_permission(self, role_perm: RolePermission):
        await self.db.delete(role_perm)
        await self.db.commit()

    async def get_departments(self, org_id: int) -> List[Department]:
        result = await self.db.execute(select(Department).where(Department.organization_id == org_id))
        return result.scalars().all()

    async def get_department_by_id(self, dept_id: int) -> Optional[Department]:
        return await self.db.get(Department, dept_id)

    async def create_department(self, dept: Department) -> Department:
        self.db.add(dept)
        await self.db.commit()
        await self.db.refresh(dept)
        return dept

    async def delete_department(self, dept: Department):
        await self.db.delete(dept)
        await self.db.commit()

    async def get_leave_types(self, org_id: int) -> List[LeaveType]:
        result = await self.db.execute(select(LeaveType).where(LeaveType.organization_id == org_id))
        return result.scalars().all()

    async def get_leave_type(self, org_id: int, leave_type_id: int) -> Optional[LeaveType]:
        result = await self.db.execute(select(LeaveType).where(
            (LeaveType.id == leave_type_id) & (LeaveType.organization_id == org_id)
        ))
        return result.scalar_one_or_none()

    async def create_leave_type(self, leave_type: LeaveType) -> LeaveType:
        self.db.add(leave_type)
        await self.db.commit()
        await self.db.refresh(leave_type)
        return leave_type

    async def delete_leave_type(self, leave_type: LeaveType):
        await self.db.delete(leave_type)
        await self.db.commit()

    async def get_employees(self, org_id: int) -> List[Employee]:
        result = await self.db.execute(select(Employee).where(Employee.organization_id == org_id))
        return result.scalars().all()

    async def get_recent_audit_logs(self, org_id: int, limit: int = 50) -> List[AuditLog]:
        result = await self.db.execute(
            select(AuditLog)
            .join(Employee, Employee.id == AuditLog.actor_id)
            .where(Employee.organization_id == org_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
