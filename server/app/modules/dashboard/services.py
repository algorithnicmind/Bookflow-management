from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveBalance
from app.modules.dashboard.schemas import DashboardResponse, DashboardStats
from app.core.utils import get_business_days

class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_stats(self, current_user: Employee) -> DashboardResponse:
        stats = DashboardStats()
        recent_leaves = []
        balances_res = []
        
        # 1. Employee-specific stats
        l_res = await self.db.execute(
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == current_user.id)
            .order_by(LeaveRequest.created_at.desc())
        )
        user_leaves = l_res.scalars().all()
        
        stats.total_requests = len(user_leaves)
        for leave in user_leaves:
            if leave.status == "pending": stats.pending += 1
            elif leave.status == "approved": stats.approved += 1
            elif leave.status == "rejected": stats.rejected += 1
            
        for leave in user_leaves[:5]: # recent 5 leaves
            recent_leaves.append({
                "id": leave.id,
                "employee_id": leave.employee_id,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "reason": leave.reason,
                "status": leave.status,
                "created_at": leave.created_at,
                "updated_at": leave.updated_at,
                "days": get_business_days(leave.start_date, leave.end_date)
            })
            
        current_year = datetime.today().year
        b_res = await self.db.execute(
            select(LeaveBalance)
            .where(LeaveBalance.employee_id == current_user.id, LeaveBalance.year == current_year)
        )
        user_balances = b_res.scalars().all()
        
        for b in user_balances:
            balances_res.append({
                "leave_type": b.leave_type,
                "total_days": b.total_days,
                "used_days": b.used_days,
                "remaining": b.total_days - b.used_days
            })
            
        response = DashboardResponse(
            role=current_user.role,
            stats=stats,
            recent_leaves=recent_leaves,
            balances=balances_res
        )
        
        # 2. Manager-specific stats
        if current_user.role in ["manager", "admin", "super_admin"]:
            is_admin = current_user.role in ["admin", "super_admin"]
            if is_admin:
                p_res = await self.db.execute(
                    select(func.count(LeaveRequest.id))
                    .where(
                        LeaveRequest.status == "pending",
                        LeaveRequest.organization_id == current_user.organization_id
                    )
                )
            else:
                p_res = await self.db.execute(
                    select(func.count(LeaveRequest.id))
                    .join(Employee)
                    .where(LeaveRequest.status == "pending", Employee.manager_id == current_user.id)
                )
            response.team_pending_count = p_res.scalar()
            
            # team on leave today
            today = datetime.today().date()
            if is_admin:
                on_leave_res = await self.db.execute(
                    select(Employee.name)
                    .join(LeaveRequest)
                    .where(
                        LeaveRequest.status == "approved",
                        LeaveRequest.start_date <= today,
                        LeaveRequest.end_date >= today,
                        LeaveRequest.organization_id == current_user.organization_id
                    )
                )
            else:
                on_leave_res = await self.db.execute(
                    select(Employee.name)
                    .join(LeaveRequest)
                    .where(
                        Employee.manager_id == current_user.id,
                        LeaveRequest.status == "approved",
                        LeaveRequest.start_date <= today,
                        LeaveRequest.end_date >= today
                    )
                )
            response.team_on_leave_today = [name for name in on_leave_res.scalars().all()]

            
        # 3. Admin-specific org stats
        if current_user.role in ["admin", "super_admin"]:
            e_res = await self.db.execute(
                select(func.count(Employee.id))
                .where(Employee.organization_id == current_user.organization_id)
            )
            total_employees = e_res.scalar()
            
            total_l_res = await self.db.execute(
                select(func.count(LeaveRequest.id))
                .where(LeaveRequest.organization_id == current_user.organization_id)
            )
            total_reqs = total_l_res.scalar()
            
            dept_res = await self.db.execute(
                select(Employee.department, func.count(Employee.id))
                .where(Employee.organization_id == current_user.organization_id)
                .group_by(Employee.department)
            )
            dept_breakdown = [{"department": r[0], "count": r[1]} for r in dept_res.all()]

            
            response.org_stats = {
                "total_employees": total_employees,
                "total_requests": total_reqs,
                "department_breakdown": dept_breakdown
            }
            
        return response
