from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from sqlalchemy.orm import joinedload
from typing import List, Optional
from datetime import date
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.modules.employees.models import Employee

class LeaveRepository:
    def __init__(self, db: AsyncSession, organization_id: int):
        self.db = db
        self.organization_id = organization_id

    async def get_request_by_id(self, leave_id: int) -> Optional[LeaveRequest]:
        result = await self.db.execute(select(LeaveRequest).where(
            LeaveRequest.id == leave_id,
            LeaveRequest.organization_id == self.organization_id
        ))
        return result.scalar_one_or_none()

    async def get_request_with_employee(self, leave_id: int):
        result = await self.db.execute(
            select(LeaveRequest, Employee)
            .join(Employee, LeaveRequest.employee_id == Employee.id)
            .where(
                LeaveRequest.id == leave_id,
                LeaveRequest.organization_id == self.organization_id
            )
        )
        return result.first()

    async def get_overlapping_requests(self, employee_id: int, start_date: date, end_date: date) -> List[LeaveRequest]:
        query = select(LeaveRequest).where(
            LeaveRequest.employee_id == employee_id,
            LeaveRequest.organization_id == self.organization_id,
            LeaveRequest.status.in_(["pending", "approved"]),
            or_(
                and_(LeaveRequest.start_date <= start_date, LeaveRequest.end_date >= start_date),
                and_(LeaveRequest.start_date <= end_date, LeaveRequest.end_date >= end_date),
                and_(LeaveRequest.start_date >= start_date, LeaveRequest.end_date <= end_date)
            )
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_balance(self, employee_id: int, leave_type: str, year: int) -> Optional[LeaveBalance]:
        query = select(LeaveBalance).where(
            LeaveBalance.employee_id == employee_id,
            LeaveBalance.organization_id == self.organization_id,
            LeaveBalance.leave_type == leave_type,
            LeaveBalance.year == year
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_balances(self, employee_id: int, year: int) -> List[LeaveBalance]:
        query = select(LeaveBalance).where(
            LeaveBalance.employee_id == employee_id,
            LeaveBalance.organization_id == self.organization_id,
            LeaveBalance.year == year
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def list_history(self, employee_id: int, status: Optional[str] = None) -> List[LeaveRequest]:
        query = select(LeaveRequest).options(
            joinedload(LeaveRequest.approval).joinedload(LeaveApproval.manager)
        ).where(
            LeaveRequest.employee_id == employee_id,
            LeaveRequest.organization_id == self.organization_id
        )
        if status and status.lower() != "all":
            query = query.where(LeaveRequest.status == status.lower())
        query = query.order_by(LeaveRequest.created_at.desc())
        result = await self.db.execute(query)
        return list(result.unique().scalars().all())

    async def list_pending_requests_for_manager(self, manager_id: int):
        query = select(LeaveRequest, Employee).join(Employee).where(
            LeaveRequest.status == "pending",
            LeaveRequest.organization_id == self.organization_id,
            Employee.manager_id == manager_id
        )
        result = await self.db.execute(query)
        return result.all()

    async def list_all_pending_requests(self):
        query = select(LeaveRequest, Employee).join(Employee).where(
            LeaveRequest.status == "pending",
            LeaveRequest.organization_id == self.organization_id
        )
        result = await self.db.execute(query)
        return result.all()


    async def create_request(self, leave: LeaveRequest) -> LeaveRequest:
        leave.organization_id = self.organization_id
        self.db.add(leave)
        await self.db.flush()
        return leave

    async def add_approval(self, approval: LeaveApproval):
        approval.organization_id = self.organization_id
        self.db.add(approval)
        await self.db.flush()

    async def commit(self):
        await self.db.commit()
