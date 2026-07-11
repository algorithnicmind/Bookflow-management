"""
Leave Management API Routes
---------------------------
This module exposes endpoints for employees to apply for leaves, view balances,
and for managers/admins to approve or reject leave requests.
"""
from fastapi import APIRouter, Depends, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, PermissionChecker, limiter
from app.core.tenant import get_current_tenant
from app.core.pagination import PaginationParams
from app.modules.employees.models import Employee
from app.modules.organizations.models import Organization
from app.modules.leaves.schemas import LeaveApplication, LeaveApprovalAction
from app.modules.leaves.repositories import LeaveRepository
from app.modules.leaves.services import LeaveService
from datetime import datetime

router = APIRouter(prefix="/api/leaves", tags=["leaves"])

def get_leave_service(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant)
) -> LeaveService:
    """
    Dependency injection for LeaveService.
    Scopes all leave operations strictly to the user's organization (tenant)
    to ensure isolated multi-tenancy.
    """
    repo = LeaveRepository(db, tenant.id)
    return LeaveService(repo)

@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def apply_leave(
    request: Request,
    payload: LeaveApplication,
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(get_current_user),
    current_org: Organization = Depends(get_current_tenant)
):
    """
    Apply for a Leave.
    Accessible by any authenticated employee. 
    The service layer will validate dates against public holidays, ensure sufficient 
    balance exists, deduct the balance iteratively, and log the action.
    """
    return await service.apply_leave(current_user.id, payload, current_org.id)

@router.get("")
async def get_leave_history(
    status: Optional[str] = Query("all"),
    pagination: PaginationParams = Depends(),
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(get_current_user)
):
    """
    View Leave History.
    Returns past and present leave requests submitted by the logged-in employee.
    Supports pagination (page, per_page) and optional status filter.
    """
    leaves = await service.get_leave_history(current_user.id, status)
    total = len(leaves)
    paginated = leaves[pagination.offset:pagination.offset + pagination.per_page]
    return {
        "leaves": paginated,
        "total": total,
        "page": pagination.page,
        "per_page": pagination.per_page,
    }

@router.get("/balance")
async def get_balances(
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(get_current_user)
):
    """
    Fetch Leave Balances.
    Returns the accrued and used leave days broken down by leave type for the current year.
    """
    current_year = datetime.today().year
    balances = await service.get_balances(current_user.id)
    return {"balances": balances, "year": current_year}

@router.put("/{leave_id}/cancel")
async def cancel_leave(
    leave_id: int,
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(get_current_user)
):
    """
    Cancel a Leave Request.
    Allows an employee to cancel a pending or approved leave before it is fully taken,
    which refunds their leave balance appropriately.
    """
    return await service.cancel_leave(leave_id, current_user.id)

@router.get("/pending")
async def get_pending_requests(
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(PermissionChecker("manage_leaves"))
):
    """
    Get Pending Approvals.
    Restricted to users with 'manage_leaves' permission (e.g., Managers, HR).
    Returns a list of leave requests waiting for this specific user's approval in the multi-tier approval chain.
    """
    # Check if the user is a super admin who can override and see all pending requests
    is_admin = "manage_everything" in getattr(current_user, "permissions", []) or "manage_employees" in getattr(current_user, "permissions", [])
    pending = await service.get_pending_requests(current_user.id, is_admin)
    return {"pending": pending}


@router.put("/{leave_id}/approve")
async def approve_leave(
    leave_id: int,
    action: LeaveApprovalAction,
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(PermissionChecker("manage_leaves")),
    current_org: Organization = Depends(get_current_tenant)
):
    """
    Approve a Leave Request.
    Steps the request forward in the multi-tier Approval Chain. 
    If it's the final required step, marks the leave request as fully approved.
    """
    is_admin = "manage_everything" in getattr(current_user, "permissions", []) or "manage_employees" in getattr(current_user, "permissions", [])
    return await service.approve_leave(leave_id, current_user.id, is_admin, action, current_org.id)

@router.put("/{leave_id}/reject")
async def reject_leave(
    leave_id: int,
    action: LeaveApprovalAction,
    service: LeaveService = Depends(get_leave_service),
    current_user: Employee = Depends(PermissionChecker("manage_leaves"))
):
    """
    Reject a Leave Request.
    Immediately halts the approval chain, marks the leave as rejected, 
    and refunds the deducted leave balance back to the employee.
    """
    is_admin = "manage_everything" in getattr(current_user, "permissions", []) or "manage_employees" in getattr(current_user, "permissions", [])
    return await service.reject_leave(leave_id, current_user.id, is_admin, action)
