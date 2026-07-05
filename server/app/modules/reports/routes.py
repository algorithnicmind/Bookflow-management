"""
Reporting API Routes
--------------------
Generates organizational leave reports, calculating metrics like total leaves taken, pending requests,
and departmental breakdowns for administrators.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import PermissionChecker
from app.core.tenant import get_current_tenant
from app.modules.organizations.models import Organization
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/organization")
async def get_organization_report(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(PermissionChecker("manage_settings"))
):
    e_res = await db.execute(
        select(func.count(Employee.id))
        .where(Employee.organization_id == tenant.id)
    )
    total_employees = e_res.scalar()

    a_res = await db.execute(
        select(func.count(Employee.id))
        .where(Employee.role == "admin", Employee.organization_id == tenant.id)
    )
    total_admins = a_res.scalar()

    l_res = await db.execute(
        select(func.count(LeaveRequest.id))
        .where(LeaveRequest.organization_id == tenant.id)
    )
    total_requests = l_res.scalar()

    app_res = await db.execute(
        select(func.count(LeaveRequest.id))
        .where(LeaveRequest.status == "approved", LeaveRequest.organization_id == tenant.id)
    )
    approved = app_res.scalar()

    rej_res = await db.execute(
        select(func.count(LeaveRequest.id))
        .where(LeaveRequest.status == "rejected", LeaveRequest.organization_id == tenant.id)
    )
    rejected = rej_res.scalar()

    dept_res = await db.execute(
        select(Employee.department, func.count(Employee.id))
        .where(Employee.organization_id == tenant.id)
        .group_by(Employee.department)
    )
    dept_breakdown = [
        {"department": r[0], "employees": r[1]} for r in dept_res.all()
    ]

    role_res = await db.execute(
        select(Employee.role, func.count(Employee.id))
        .where(Employee.organization_id == tenant.id)
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

@router.get("/leaves-export")
async def export_leaves_report(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant),
    current_user: Employee = Depends(PermissionChecker("manage_employees"))
):
    # Query all leaves and join with Employee to get names and departments
    stmt = select(LeaveRequest, Employee).join(Employee, LeaveRequest.employee_id == Employee.id).where(
        LeaveRequest.organization_id == tenant.id
    ).order_by(LeaveRequest.created_at.desc())
    result = await db.execute(stmt)
    rows = result.all()
    
    export_data = []
    for leave, emp in rows:
        export_data.append({
            "id": leave.id,
            "employee_name": emp.name,
            "department": emp.department,
            "leave_type": leave.leave_type,
            "start_date": leave.start_date.isoformat(),
            "end_date": leave.end_date.isoformat(),
            "status": leave.status,
            "reason": leave.reason,
            "applied_on": leave.created_at.isoformat() if leave.created_at else None
        })
        
    return {"leaves": export_data}

