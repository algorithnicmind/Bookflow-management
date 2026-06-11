from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import RoleChecker
from app.modules.employees.models import Employee

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/organization")
async def get_organization_report(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin"]))
):
    e_res = await db.execute(select(func.count(Employee.id)))
    total_employees = e_res.scalar()

    a_res = await db.execute(
        select(func.count(Employee.id)).where(Employee.role == "admin")
    )
    total_admins = a_res.scalar()

    from app.modules.leaves.models import LeaveRequest
    l_res = await db.execute(select(func.count(LeaveRequest.id)))
    total_requests = l_res.scalar()

    app_res = await db.execute(
        select(func.count(LeaveRequest.id)).where(LeaveRequest.status == "approved")
    )
    approved = app_res.scalar()

    rej_res = await db.execute(
        select(func.count(LeaveRequest.id)).where(LeaveRequest.status == "rejected")
    )
    rejected = rej_res.scalar()

    dept_res = await db.execute(
        select(Employee.department, func.count(Employee.id))
        .group_by(Employee.department)
    )
    dept_breakdown = [
        {"department": r[0], "employees": r[1]} for r in dept_res.all()
    ]

    role_res = await db.execute(
        select(Employee.role, func.count(Employee.id))
        .group_by(Employee.role)
    )
    role_breakdown = [
        {"role": r[0], "count": r[1]} for r in role_res.all()
    ]

    return {
        "org_stats": {
            "total_employees": total_employees,
            "total_admins": total_admins,
            "total_leave_requests": total_requests,
            "approved_leaves": approved,
            "rejected_leaves": rejected,
            "department_breakdown": dept_breakdown,
            "role_breakdown": role_breakdown,
        }
    }
