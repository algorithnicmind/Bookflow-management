from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import Employee, LeaveBalance, LeaveRequest, LeaveApproval
from app.schemas import LeaveApplication, LeaveApprovalAction, LeaveResponse
from app.dependencies import get_current_user, RoleChecker
from app.utils import get_business_days

router = APIRouter(prefix="/api/leaves", tags=["leaves"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def apply_leave(
    request: LeaveApplication,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    today = datetime.today().date()
    if request.start_date < today:
        raise HTTPException(status_code=400, detail="Start date cannot be in the past")
    if request.end_date < request.start_date:
        raise HTTPException(status_code=400, detail="End date must be on or after start date")
        
    # Check for overlaps
    overlap_query = select(LeaveRequest).where(
        LeaveRequest.employee_id == current_user.id,
        LeaveRequest.status.in_(["pending", "approved"]),
        or_(
            and_(LeaveRequest.start_date <= request.start_date, LeaveRequest.end_date >= request.start_date),
            and_(LeaveRequest.start_date <= request.end_date, LeaveRequest.end_date >= request.end_date),
            and_(LeaveRequest.start_date >= request.start_date, LeaveRequest.end_date <= request.end_date)
        )
    )
    overlap_res = await db.execute(overlap_query)
    if overlap_res.scalars().first():
        raise HTTPException(status_code=400, detail="You have an overlapping leave request for these dates")
        
    requested_days = get_business_days(request.start_date, request.end_date)
    
    # Check balance for paid leaves
    if request.leave_type != "unpaid":
        current_year = today.year
        balance_query = select(LeaveBalance).where(
            LeaveBalance.employee_id == current_user.id,
            LeaveBalance.leave_type == request.leave_type,
            LeaveBalance.year == current_year
        )
        balance_res = await db.execute(balance_query)
        balance = balance_res.scalar_one_or_none()
        
        if not balance:
            raise HTTPException(status_code=400, detail=f"No {request.leave_type} balance record found")
            
        remaining = balance.total_days - balance.used_days
        if remaining < requested_days:
            raise HTTPException(status_code=400, detail=f"Insufficient {request.leave_type} balance. Available: {remaining} days")
            
        # Deduct balance
        balance.used_days += requested_days
        
    new_request = LeaveRequest(
        employee_id=current_user.id,
        leave_type=request.leave_type,
        start_date=request.start_date,
        end_date=request.end_date,
        reason=request.reason,
        status="pending"
    )
    
    db.add(new_request)
    await db.commit()
    return {"message": "Leave application submitted successfully"}

@router.get("")
async def get_leave_history(
    status: Optional[str] = Query("all"),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    query = select(LeaveRequest).where(LeaveRequest.employee_id == current_user.id)
    if status and status.lower() != "all":
        query = query.where(LeaveRequest.status == status.lower())
    
    query = query.order_by(LeaveRequest.created_at.desc())
    result = await db.execute(query)
    leaves = result.scalars().all()
    
    responses = []
    for leave in leaves:
        ld = LeaveResponse.model_validate(leave)
        ld.days = get_business_days(leave.start_date, leave.end_date)
        responses.append(ld)
        
    return {"leaves": responses}

@router.get("/balance")
async def get_balances(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    current_year = datetime.today().year
    query = select(LeaveBalance).where(
        LeaveBalance.employee_id == current_user.id,
        LeaveBalance.year == current_year
    )
    result = await db.execute(query)
    balances = result.scalars().all()
    
    res = []
    for b in balances:
        res.append({
            "leave_type": b.leave_type,
            "total_days": b.total_days,
            "used_days": b.used_days,
            "remaining": b.total_days - b.used_days
        })
        
    return {"balances": res, "year": current_year}

@router.put("/{leave_id}/cancel")
async def cancel_leave(
    leave_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == leave_id))
    leave = result.scalar_one_or_none()
    
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own leave requests")
    if leave.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending leaves can be cancelled")
        
    leave.status = "cancelled"
    
    # Restore balance
    if leave.leave_type != "unpaid":
        requested_days = get_business_days(leave.start_date, leave.end_date)
        current_year = leave.start_date.year
        b_res = await db.execute(select(LeaveBalance).where(
            LeaveBalance.employee_id == leave.employee_id,
            LeaveBalance.leave_type == leave.leave_type,
            LeaveBalance.year == current_year
        ))
        balance = b_res.scalar_one_or_none()
        if balance:
            balance.used_days -= requested_days
            
    await db.commit()
    return {"message": "Leave request cancelled successfully"}

@router.get("/pending")
async def get_pending_requests(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["manager", "admin", "super_admin"]))
):
    # Only fetch leaves from direct reports
    query = select(LeaveRequest, Employee).join(Employee).where(
        LeaveRequest.status == "pending",
        Employee.manager_id == current_user.id
    )
    result = await db.execute(query)
    rows = result.all()
    
    res = []
    for leave, emp in rows:
        ld = LeaveResponse.model_validate(leave)
        ld.days = get_business_days(leave.start_date, leave.end_date)
        ld.employee_name = emp.name
        ld.department = emp.department
        res.append(ld)
        
    return {"pending": res}

@router.put("/{leave_id}/approve")
async def approve_leave(
    leave_id: int,
    action: LeaveApprovalAction,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["manager", "admin", "super_admin"]))
):
    result = await db.execute(select(LeaveRequest, Employee).join(Employee).where(LeaveRequest.id == leave_id))
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave, emp = row
    if leave.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending leaves can be approved")
    if emp.manager_id != current_user.id and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="You can only approve requests from your direct reports")
        
    leave.status = "approved"
    approval = LeaveApproval(
        leave_request_id=leave.id,
        manager_id=current_user.id,
        action="approved",
        comments=action.comments
    )
    db.add(approval)
    await db.commit()
    return {"message": "Leave request approved"}

@router.put("/{leave_id}/reject")
async def reject_leave(
    leave_id: int,
    action: LeaveApprovalAction,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["manager", "admin", "super_admin"]))
):
    if not action.comments or not action.comments.strip():
        raise HTTPException(status_code=400, detail="Rejection reason is required")
        
    result = await db.execute(select(LeaveRequest, Employee).join(Employee).where(LeaveRequest.id == leave_id))
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave, emp = row
    if leave.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending leaves can be rejected")
    if emp.manager_id != current_user.id and current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="You can only reject requests from your direct reports")
        
    leave.status = "rejected"
    approval = LeaveApproval(
        leave_request_id=leave.id,
        manager_id=current_user.id,
        action="rejected",
        comments=action.comments
    )
    db.add(approval)
    
    # Restore balance
    if leave.leave_type != "unpaid":
        requested_days = get_business_days(leave.start_date, leave.end_date)
        current_year = leave.start_date.year
        b_res = await db.execute(select(LeaveBalance).where(
            LeaveBalance.employee_id == leave.employee_id,
            LeaveBalance.leave_type == leave.leave_type,
            LeaveBalance.year == current_year
        ))
        balance = b_res.scalar_one_or_none()
        if balance:
            balance.used_days -= requested_days
            
    await db.commit()
    return {"message": "Leave request rejected"}
