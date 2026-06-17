from datetime import datetime
from fastapi import HTTPException
from typing import List, Optional
from sqlalchemy.future import select
from app.modules.leaves.repositories import LeaveRepository
from app.modules.leaves.models import LeaveRequest, LeaveApproval
from app.modules.leaves.schemas import LeaveApplication, LeaveApprovalAction
from app.modules.employees.models import Employee
from app.modules.notifications.models import Notification
from app.modules.audit.services import AuditLogService

class LeaveService:
    def __init__(self, repo: LeaveRepository):
        self.repo = repo

    async def _get_employee(self, employee_id: int) -> Optional[Employee]:
        result = await self.repo.db.execute(select(Employee).where(Employee.id == employee_id))
        return result.scalar_one_or_none()

    async def _create_notification(self, user_id: int, title: str, message: str, ntype: str = "info", action_url: str = None):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=ntype,
            action_url=action_url,
        )
        self.repo.db.add(notification)

    def get_business_days(self, start_date, end_date) -> int:
        return (end_date - start_date).days + 1

    async def apply_leave(self, employee_id: int, request: LeaveApplication) -> dict:
        today = datetime.today().date()
        if request.start_date < today:
            raise HTTPException(status_code=400, detail="Start date cannot be in the past")
        if request.end_date < request.start_date:
            raise HTTPException(status_code=400, detail="End date must be on or after start date")

        # Check for overlaps
        overlaps = await self.repo.get_overlapping_requests(employee_id, request.start_date, request.end_date)
        if overlaps:
            raise HTTPException(status_code=400, detail="You have an overlapping leave request for these dates")

        requested_days = self.get_business_days(request.start_date, request.end_date)

        # Check balance for paid leaves
        if request.leave_type != "unpaid":
            current_year = today.year
            balance = await self.repo.get_balance(employee_id, request.leave_type, current_year)
            if not balance:
                raise HTTPException(status_code=400, detail=f"No {request.leave_type} balance record found")

            remaining = balance.total_days - balance.used_days
            if remaining < requested_days:
                raise HTTPException(status_code=400, detail=f"Insufficient {request.leave_type} balance. Available: {remaining} days")

            # Deduct balance
            balance.used_days += requested_days

        new_request = LeaveRequest(
            employee_id=employee_id,
            leave_type=request.leave_type,
            start_date=request.start_date,
            end_date=request.end_date,
            reason=request.reason,
            status="pending"
        )
        await self.repo.create_request(new_request)
        
        # Log audit trail
        await AuditLogService.log_action(
            db=self.repo.db,
            actor_id=employee_id,
            action="leave_apply",
            target_type="leave_request",
            target_id=new_request.id,
            details={
                "leave_type": request.leave_type,
                "start_date": request.start_date.isoformat(),
                "end_date": request.end_date.isoformat(),
                "requested_days": requested_days
            }
        )
        
        await self.repo.commit()

        employee = await self._get_employee(employee_id)
        if employee and employee.manager_id:
            days = self.get_business_days(request.start_date, request.end_date)
            await self._create_notification(
                user_id=employee.manager_id,
                title="New Leave Application",
                message=f"{employee.name} submitted a request for {days} day(s) of {request.leave_type}.",
                ntype="warning",
                action_url="/pending-requests"
            )
            await self.repo.commit()

        return {"message": "Leave application submitted successfully"}

    async def get_leave_history(self, employee_id: int, status: Optional[str] = "all") -> List[dict]:
        leaves = await self.repo.list_history(employee_id, status)
        responses = []
        for leave in leaves:
            approval_data = None
            if leave.approval:
                approval_data = {
                    "manager_name": leave.approval.manager.name if leave.approval.manager else None,
                    "action": leave.approval.action,
                    "comments": leave.approval.comments,
                    "acted_at": leave.approval.acted_at
                }
            responses.append({
                "id": leave.id,
                "employee_id": leave.employee_id,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "reason": leave.reason,
                "status": leave.status,
                "created_at": leave.created_at,
                "updated_at": leave.updated_at,
                "days": self.get_business_days(leave.start_date, leave.end_date),
                "approval": approval_data
            })
        return responses

    async def get_balances(self, employee_id: int) -> List[dict]:
        current_year = datetime.today().year
        balances = await self.repo.get_balances(employee_id, current_year)
        res = []
        for b in balances:
            res.append({
                "leave_type": b.leave_type,
                "total_days": b.total_days,
                "used_days": b.used_days,
                "remaining": b.total_days - b.used_days
            })
        return res

    async def cancel_leave(self, leave_id: int, employee_id: int) -> dict:
        leave = await self.repo.get_request_by_id(leave_id)
        if not leave:
            raise HTTPException(status_code=404, detail="Leave request not found")
        if leave.employee_id != employee_id:
            raise HTTPException(status_code=403, detail="You can only cancel your own leave requests")
        if leave.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending leaves can be cancelled")

        leave.status = "cancelled"

        # Restore balance
        if leave.leave_type != "unpaid":
            requested_days = self.get_business_days(leave.start_date, leave.end_date)
            current_year = leave.start_date.year
            balance = await self.repo.get_balance(leave.employee_id, leave.leave_type, current_year)
            if balance:
                balance.used_days -= requested_days

        # Log audit trail
        await AuditLogService.log_action(
            db=self.repo.db,
            actor_id=employee_id,
            action="leave_cancel",
            target_type="leave_request",
            target_id=leave.id,
            details={
                "leave_type": leave.leave_type,
                "start_date": leave.start_date.isoformat(),
                "end_date": leave.end_date.isoformat()
            }
        )

        await self.repo.commit()

        employee = await self._get_employee(leave.employee_id)
        if employee and employee.manager_id:
            days = self.get_business_days(leave.start_date, leave.end_date)
            await self._create_notification(
                user_id=employee.manager_id,
                title="Leave Request Cancelled",
                message=f"{employee.name} cancelled their pending {leave.leave_type} request for {days} day(s).",
                ntype="info",
                action_url="/pending-requests"
            )
            await self.repo.commit()

        return {"message": "Leave request cancelled successfully"}

    async def get_pending_requests(self, manager_id: int, is_admin: bool = False) -> List[dict]:
        if is_admin:
            rows = await self.repo.list_all_pending_requests()
        else:
            rows = await self.repo.list_pending_requests_for_manager(manager_id)
        res = []
        for leave, emp in rows:
            res.append({
                "id": leave.id,
                "employee_id": leave.employee_id,
                "leave_type": leave.leave_type,
                "start_date": leave.start_date,
                "end_date": leave.end_date,
                "reason": leave.reason,
                "status": leave.status,
                "created_at": leave.created_at,
                "updated_at": leave.updated_at,
                "days": self.get_business_days(leave.start_date, leave.end_date),
                "employee_name": emp.name,
                "department": emp.department
            })
        return res


    async def approve_leave(self, leave_id: int, manager_id: int, is_admin: bool, action: LeaveApprovalAction) -> dict:
        row = await self.repo.get_request_with_employee(leave_id)
        if not row:
            raise HTTPException(status_code=404, detail="Leave request not found")

        leave, emp = row
        if leave.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending leaves can be approved")
        if emp.manager_id != manager_id and not is_admin:
            raise HTTPException(status_code=403, detail="You can only approve requests from your direct reports")

        leave.status = "approved"
        approval = LeaveApproval(
            leave_request_id=leave.id,
            manager_id=manager_id,
            action="approved",
            comments=action.comments
        )
        await self.repo.add_approval(approval)
        
        # Log audit trail
        await AuditLogService.log_action(
            db=self.repo.db,
            actor_id=manager_id,
            action="leave_approve",
            target_type="leave_request",
            target_id=leave.id,
            details={
                "comments": action.comments,
                "leave_type": leave.leave_type,
                "employee_name": emp.name,
                "employee_id": emp.id
            }
        )

        await self.repo.commit()

        days = self.get_business_days(leave.start_date, leave.end_date)
        await self._create_notification(
            user_id=leave.employee_id,
            title="Leave Request Approved",
            message=f"Your request for {days} day(s) of {leave.leave_type} has been approved.",
            ntype="success",
            action_url="/leave-history"
        )
        await self.repo.commit()

        return {"message": "Leave request approved"}

    async def reject_leave(self, leave_id: int, manager_id: int, is_admin: bool, action: LeaveApprovalAction) -> dict:
        if not action.comments or not action.comments.strip():
            raise HTTPException(status_code=400, detail="Rejection reason is required")

        row = await self.repo.get_request_with_employee(leave_id)
        if not row:
            raise HTTPException(status_code=404, detail="Leave request not found")

        leave, emp = row
        if leave.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending leaves can be rejected")
        if emp.manager_id != manager_id and not is_admin:
            raise HTTPException(status_code=403, detail="You can only reject requests from your direct reports")

        leave.status = "rejected"
        approval = LeaveApproval(
            leave_request_id=leave.id,
            manager_id=manager_id,
            action="rejected",
            comments=action.comments
        )
        await self.repo.add_approval(approval)

        # Restore balance
        if leave.leave_type != "unpaid":
            requested_days = self.get_business_days(leave.start_date, leave.end_date)
            current_year = leave.start_date.year
            balance = await self.repo.get_balance(leave.employee_id, leave.leave_type, current_year)
            if balance:
                balance.used_days -= requested_days

        # Log audit trail
        await AuditLogService.log_action(
            db=self.repo.db,
            actor_id=manager_id,
            action="leave_reject",
            target_type="leave_request",
            target_id=leave.id,
            details={
                "comments": action.comments,
                "leave_type": leave.leave_type,
                "employee_name": emp.name,
                "employee_id": emp.id
            }
        )

        await self.repo.commit()

        days = self.get_business_days(leave.start_date, leave.end_date)
        await self._create_notification(
            user_id=leave.employee_id,
            title="Leave Request Rejected",
            message=f"Your request for {days} day(s) of {leave.leave_type} has been rejected. Reason: {action.comments}",
            ntype="danger",
            action_url="/leave-history"
        )
        await self.repo.commit()

        return {"message": "Leave request rejected"}
