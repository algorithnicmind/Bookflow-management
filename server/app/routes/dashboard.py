from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime

from app.database import get_db
from app.models import Employee, LeaveRequest, LeaveBalance
from app.schemas import DashboardResponse, DashboardStats, LeaveResponse, LeaveBalanceResponse
from app.dependencies import get_current_user
from app.utils import get_business_days

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    stats = DashboardStats()
    recent_leaves = []
    balances_res = []
    
    # 1. Employee-specific stats
    status_counts_res = await db.execute(
        select(LeaveRequest.status, func.count(LeaveRequest.id))
        .where(LeaveRequest.employee_id == current_user.id)
        .group_by(LeaveRequest.status)
    )
    status_counts = status_counts_res.all()
    
    for status, count in status_counts:
        stats.total_requests += count
        if status == "pending": stats.pending = count
        elif status == "approved": stats.approved = count
        elif status == "rejected": stats.rejected = count
        
    recent_leaves_res = await db.execute(
        select(LeaveRequest)
        .where(LeaveRequest.employee_id == current_user.id)
        .order_by(LeaveRequest.created_at.desc())
        .limit(5)
    )
    user_leaves = recent_leaves_res.scalars().all()
        
    for leave in user_leaves: # recent 5 leaves
        ld = LeaveResponse.model_validate(leave)
        ld.days = get_business_days(leave.start_date, leave.end_date)
        recent_leaves.append(ld)
        
    current_year = datetime.today().year
    b_res = await db.execute(select(LeaveBalance).where(
        LeaveBalance.employee_id == current_user.id, LeaveBalance.year == current_year
    ))
    user_balances = b_res.scalars().all()
    
    for b in user_balances:
        balances_res.append(LeaveBalanceResponse(
            leave_type=b.leave_type,
            total_days=b.total_days,
            used_days=b.used_days,
            remaining=b.total_days - b.used_days
        ))
        
    response = DashboardResponse(
        role=current_user.role,
        stats=stats,
        recent_leaves=recent_leaves,
        balances=balances_res
    )
    
    # 2. Manager-specific stats
    if current_user.role in ["manager", "admin", "super_admin"]:
        p_res = await db.execute(select(func.count(LeaveRequest.id)).join(Employee).where(
            LeaveRequest.status == "pending", Employee.manager_id == current_user.id
        ))
        response.team_pending_count = p_res.scalar()
        
        # team on leave today
        today = datetime.today().date()
        on_leave_res = await db.execute(select(Employee.name).join(LeaveRequest).where(
            Employee.manager_id == current_user.id,
            LeaveRequest.status == "approved",
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today
        ))
        response.team_on_leave_today = [name for name in on_leave_res.scalars().all()]
        
    # 3. Admin-specific org stats
    if current_user.role in ["admin", "super_admin"]:
        e_res = await db.execute(select(func.count(Employee.id)))
        total_employees = e_res.scalar()
        
        total_l_res = await db.execute(select(func.count(LeaveRequest.id)))
        total_reqs = total_l_res.scalar()
        
        dept_res = await db.execute(select(Employee.department, func.count(Employee.id)).group_by(Employee.department))
        dept_breakdown = [{"department": r[0], "count": r[1]} for r in dept_res.all()]
        
        response.org_stats = {
            "total_employees": total_employees,
            "total_requests": total_reqs,
            "department_breakdown": dept_breakdown
        }
        
    return response
