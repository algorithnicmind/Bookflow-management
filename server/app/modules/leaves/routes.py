"""
Leave Management API Routes
---------------------------
This module exposes endpoints for employees to apply for leaves, view balances,
and for managers/admins to approve or reject leave requests.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, RoleChecker
from app.core.tenant import get_current_tenant
from app.modules.employees.models import Employee
from app.modules.organizations.models import Organization
from app.modules.leaves.schemas import LeaveApplication, LeaveApprovalAction
from app.modules.leaves.repositories import LeaveRepository
from app.modules.leaves.services import LeaveService

router = APIRouter(prefix="/api/leaves", tags=["leaves"])

def get_leave_service(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant)
) -> LeaveService:
    repo = LeaveRepository(db, tenant.id)
    return LeaveService(repo)

@router.post("", status_code=status.HTTP_201_CREATED)
async def apply_leave(
    request: LeaveApplication,
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(get_current_user)
):
    """
    Apply for a Leave.
    Accessible by any authenticated employee. Validates dates and deducts balance.
    """
    return await service.apply_leave(current_user.id, request)

@router.get("")
async def get_leave_history(
    status: Optional[str] = Query("all"),
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(get_current_user)
):
    """
    View Leave History.
    Returns all past and present leave requests for the logged-in employee.
    Optionally filter by status (e.g. 'pending', 'approved').
    """
    leaves = await service.get_leave_history(current_user.id, status)
    return {"leaves": leaves}

@router.get("/balance")
async def get_balances(
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(get_current_user)
):
    from datetime import datetime
    current_year = datetime.today().year
    balances = await service.get_balances(current_user.id)
    return {"balances": balances, "year": current_year}

@router.put("/{leave_id}/cancel")
async def cancel_leave(
    leave_id: int,
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(get_current_user)
):
    return await service.cancel_leave(leave_id, current_user.id)

@router.get("/pending")
async def get_pending_requests(
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(RoleChecker(["manager", "admin", "super_admin"]))
):
    """
    Get Pending Approvals.
    Restricted to managers and admins. Returns a list of leave requests waiting
    for the current user's approval in the approval chain.
    """
    is_admin = current_user.role in ["admin", "super_admin"]
    pending = await service.get_pending_requests(current_user.id, is_admin)
    return {"pending": pending}


@router.put("/{leave_id}/approve")
async def approve_leave(
    leave_id: int,
    action: LeaveApprovalAction,
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(RoleChecker(["manager", "admin", "super_admin"]))
):
    """
    Approve a Leave Request.
    Steps the request forward in the Approval Chain. If it's the final step,
    marks it as fully approved.
    """
    is_admin = current_user.role in ["admin", "super_admin"]
    return await service.approve_leave(leave_id, current_user.id, is_admin, action)

@router.put("/{leave_id}/reject")
async def reject_leave(
    leave_id: int,
    action: LeaveApprovalAction,
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(RoleChecker(["manager", "admin", "super_admin"]))
):
    is_admin = current_user.role in ["admin", "super_admin"]
    return await service.reject_leave(leave_id, current_user.id, is_admin, action)
