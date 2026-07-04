from datetime import datetime
from fastapi import HTTPException
from typing import List, Optional
from sqlalchemy.future import select
from app.core.utils import get_calendar_days
from app.modules.leaves.repositories import LeaveRepository
from app.modules.leaves.models import LeaveRequest, LeaveApproval
from app.modules.leaves.schemas import LeaveApplication, LeaveApprovalAction
from app.modules.employees.models import Employee
from app.modules.notifications.models import Notification
from app.modules.audit.services import AuditLogService

"""
Leave Management Services
-------------------------
This module encapsulates the core business logic for the application.
It handles leave applications, dynamic multi-step approval chains, balance deductions,
and integrations with external services (Slack, Teams, Calendar).
"""

class LeaveService:
    """
    Service Layer: Acts as the orchestrator between the API routes and the Database repositories.
    Enforces business rules such as balance limits, overlapping dates, and holiday exclusions.
    """
    def __init__(self, repo: LeaveRepository):
        self.repo = repo

    async def _get_employee(self, employee_id: int) -> Optional[Employee]:
        result = await self.repo.db.execute(select(Employee).where(Employee.id == employee_id))
        return result.scalar_one_or_none()

    async def _create_notification(self, user_id: int, title: str, message: str, ntype: str = "info", action_url: str = None):
        """Helper to create an in-app notification asynchronously."""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=ntype,
            action_url=action_url,
        )
        self.repo.db.add(notification)

    async def _validate_approval_authority(self, leave, emp, manager_id: int, is_admin: bool, action: str):
        """Shared helper: validate manager's authority to approve/reject based on approval chain."""
        from app.modules.settings.models import ApprovalChain, ApprovalStep
        chain_res = await self.repo.db.execute(select(ApprovalChain).where(
            ApprovalChain.organization_id == self.repo.organization_id,
            ApprovalChain.department == emp.department
        ))
        chain = chain_res.scalar_one_or_none()
        if not chain:
            chain_res = await self.repo.db.execute(select(ApprovalChain).where(
                ApprovalChain.organization_id == self.repo.organization_id,
                ApprovalChain.department == None
            ))
            chain = chain_res.scalar_one_or_none()

        steps = []
        if chain:
            steps_res = await self.repo.db.execute(select(ApprovalStep).where(ApprovalStep.chain_id == chain.id).order_by(ApprovalStep.step_order))
            steps = steps_res.scalars().all()

        current_step_idx = leave.current_approval_step - 1
        approver = await self._get_employee(manager_id)

        if steps and current_step_idx < len(steps):
            required_role = steps[current_step_idx].role_required
            if required_role == "manager":
                if emp.manager_id != manager_id and not is_admin:
                    raise HTTPException(status_code=403, detail=f"You can only {action} requests from your direct reports for this step")
            else:
                if approver.role != required_role and not is_admin:
                    raise HTTPException(status_code=403, detail=f"This step requires {required_role} role")
        else:
            if emp.manager_id != manager_id and not is_admin:
                raise HTTPException(status_code=403, detail=f"You can only {action} requests from your direct reports")

    async def apply_leave(self, employee_id: int, request: LeaveApplication) -> dict:
        """
        Core logic for submitting a leave application.
        
        Architectural Flow:
        1. Validates the dates (no past dates, end >= start).
        2. Checks for overlapping requests.
        3. Calculates actual business days (excluding weekends and public holidays).
        4. Validates and synchronously deducts from the user's Leave Balance.
        5. Creates the LeaveRequest record.
        6. Logs the action to the AuditLog.
        7. Sends in-app notifications and external webhook integrations (Slack/Teams).
        """
        today = datetime.today().date()
        if request.start_date < today:
            raise HTTPException(status_code=400, detail="Start date cannot be in the past")
        if request.end_date < request.start_date:
            raise HTTPException(status_code=400, detail="End date must be on or after start date")

        # Check for overlaps
        overlaps = await self.repo.get_overlapping_requests(employee_id, request.start_date, request.end_date)
        if overlaps:
            raise HTTPException(status_code=400, detail="You have an overlapping leave request for these dates")

        # Fetch holidays mapped to this tenant
        from app.modules.settings.models import PublicHoliday
        holiday_rows = await self.repo.db.execute(select(PublicHoliday.date).where(
            PublicHoliday.organization_id == self.repo.organization_id,
            PublicHoliday.date >= request.start_date,
            PublicHoliday.date <= request.end_date
        ))
        holidays = [row[0] for row in holiday_rows.all()]
        
        # Calculate raw calendar days, then subtract the holidays
        requested_days = get_calendar_days(request.start_date, request.end_date)
        requested_days -= len(holidays)
        
        if requested_days <= 0:
            raise HTTPException(status_code=400, detail="The requested dates consist only of public holidays or invalid days.")

        # Check balance for paid leaves
        from app.modules.settings.models import LeaveType
        leave_type_obj = await self.repo.db.execute(select(LeaveType).where(
            LeaveType.organization_id == self.repo.organization_id,
            LeaveType.name == request.leave_type
        ))
        leave_type = leave_type_obj.scalar_one_or_none()
        
        if leave_type and leave_type.is_paid:
            current_year = today.year
            balance = await self.repo.get_balance(employee_id, request.leave_type, current_year)
            if not balance:
                raise HTTPException(status_code=400, detail=f"No {request.leave_type} balance record found")

            remaining = balance.total_days - balance.used_days
            if remaining < requested_days:
                raise HTTPException(status_code=400, detail=f"Insufficient {request.leave_type} balance. Available: {remaining} days")

            # Deduct balance immediately upon application
            balance.used_days += requested_days

        # Create request record
        new_request = LeaveRequest(
            organization_id=self.repo.organization_id,
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

        # Send notifications
        employee = await self._get_employee(employee_id)
        if employee and employee.manager_id:
            days = get_calendar_days(request.start_date, request.end_date)

            await self._create_notification(
                user_id=employee.manager_id,
                title="New Leave Application",
                message=f"{employee.name} submitted a request for {days} day(s) of {request.leave_type}.",
                ntype="warning",
                action_url="/pending-requests"
            )
            await self.repo.commit()

            # Trigger external integrations (Slack & Teams)
            try:
                from app.modules.integrations.services import IntegrationService
                await IntegrationService.send_slack_leave_notification(
                    leave_id=new_request.id,
                    employee_name=employee.name,
                    leave_type=request.leave_type,
                    start_date=request.start_date.isoformat(),
                    end_date=request.end_date.isoformat(),
                    reason=request.reason
                )
                await IntegrationService.send_teams_leave_notification(
                    leave_id=new_request.id,
                    employee_name=employee.name,
                    leave_type=request.leave_type,
                    start_date=request.start_date.isoformat(),
                    end_date=request.end_date.isoformat(),
                    reason=request.reason
                )
            except Exception as integration_err:
                # Log integration errors but do not fail the main application flow
                import logging
                logging.getLogger("leaves").error(f"Failed to send Slack/Teams notification: {str(integration_err)}")

        return {"message": "Leave application submitted successfully"}

    async def get_leave_history(self, employee_id: int, status: Optional[str] = "all") -> List[dict]:
        """
        Fetches an employee's leave history and constructs a detailed DTO including manager action details.
        """
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
                "days": get_calendar_days(leave.start_date, leave.end_date),
                "approval": approval_data
            })
        return responses

    async def get_balances(self, employee_id: int) -> List[dict]:
        """
        Retrieves leave balances for the current calendar year.
        Calculates remaining days dynamically based on total_days and used_days.
        """
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
        """
        Allows an employee to cancel a pending leave request, safely restoring their deducted balance.
        """
        leave = await self.repo.get_request_by_id(leave_id)
        if not leave:
            raise HTTPException(status_code=404, detail="Leave request not found")
        if leave.employee_id != employee_id:
            raise HTTPException(status_code=403, detail="You can only cancel your own leave requests")
        if leave.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending leaves can be cancelled")

        leave.status = "cancelled"

        # Restore balance if it was a paid leave
        from app.modules.settings.models import LeaveType
        leave_type_obj = await self.repo.db.execute(select(LeaveType).where(
            LeaveType.organization_id == self.repo.organization_id,
            LeaveType.name == leave.leave_type
        ))
        leave_type_record = leave_type_obj.scalar_one_or_none()

        if leave_type_record and leave_type_record.is_paid:
            requested_days = get_calendar_days(leave.start_date, leave.end_date)
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
            days = get_calendar_days(leave.start_date, leave.end_date)

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
        """
        Retrieves all pending leave requests that the current user has the authority to approve.
        
        Architectural Flow (Multi-Step Approvals):
        1. Checks the dynamic Approval Chain configured for the requester's department.
        2. Looks at the `current_approval_step` of the leave request.
        3. Determines if the current user (manager or specific role like HR) has the required role
           for the current step in the chain.
        4. Admins bypass these checks to prevent bottlenecks.
        """
        rows = await self.repo.list_all_pending_requests()
        approver = await self._get_employee(manager_id)

        from app.modules.settings.models import ApprovalChain, ApprovalStep
        chains_res = await self.repo.db.execute(
            select(ApprovalChain).where(ApprovalChain.organization_id == self.repo.organization_id)
        )
        chains = chains_res.scalars().all()
        chain_ids = [c.id for c in chains]
        
        steps_res = await self.repo.db.execute(
            select(ApprovalStep).where(ApprovalStep.chain_id.in_(chain_ids)).order_by(ApprovalStep.step_order)
        ) if chain_ids else None
        all_steps = steps_res.scalars().all() if steps_res else []

        chain_map = {c.department: c.id for c in chains}
        global_chain_id = chain_map.get(None)

        filtered_rows = []
        for leave, emp in rows:
            chain_id = chain_map.get(emp.department, global_chain_id)
            steps = [s for s in all_steps if s.chain_id == chain_id] if chain_id else []
            
            current_step_idx = leave.current_approval_step - 1
            
            can_approve = False
            if steps and current_step_idx < len(steps):
                required_role = steps[current_step_idx].role_required
                if required_role == "manager":
                    if emp.manager_id == manager_id or is_admin:
                        can_approve = True
                else:
                    if approver.role == required_role or is_admin:
                        can_approve = True
            else:
                if emp.manager_id == manager_id or is_admin:
                    can_approve = True
                    
            if can_approve:
                filtered_rows.append((leave, emp))

        res = []
        for leave, emp in filtered_rows:
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
                "days": get_calendar_days(leave.start_date, leave.end_date),

                "employee_name": emp.name,
                "department": emp.department,
                "current_approval_step": getattr(leave, "current_approval_step", 1)
            })
        return res


    async def approve_leave(self, leave_id: int, manager_id: int, is_admin: bool, action: LeaveApprovalAction) -> dict:
        """
        Processes a leave approval action.
        
        Architectural Flow:
        1. Validates the user's authority to approve the current step (via the Approval Chain).
        2. Creates a LeaveApproval record.
        3. If there are more steps in the chain, increments `current_approval_step`.
        4. If it's the final step, marks the leave as 'approved' and triggers Calendar integration.
        5. Logs the action in the AuditLog.
        """
        row = await self.repo.get_request_with_employee(leave_id)
        if not row:
            raise HTTPException(status_code=404, detail="Leave request not found")

        leave, emp = row
        if leave.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending leaves can be approved")
        
        await self._validate_approval_authority(leave, emp, manager_id, is_admin, "approve")

        approval = LeaveApproval(
            organization_id=self.repo.organization_id,
            leave_request_id=leave.id,
            manager_id=manager_id,
            action="approved",
            comments=action.comments
        )
        await self.repo.add_approval(approval)
        
        # Fetch approval chain steps to determine if this is the final step
        from app.modules.settings.models import ApprovalChain, ApprovalStep
        chain_res = await self.repo.db.execute(select(ApprovalChain).where(
            ApprovalChain.organization_id == self.repo.organization_id,
            ApprovalChain.department == emp.department
        ))
        chain = chain_res.scalar_one_or_none()
        if not chain:
            chain_res = await self.repo.db.execute(select(ApprovalChain).where(
                ApprovalChain.organization_id == self.repo.organization_id,
                ApprovalChain.department == None
            ))
            chain = chain_res.scalar_one_or_none()

        steps = []
        if chain:
            steps_res = await self.repo.db.execute(
                select(ApprovalStep).where(ApprovalStep.chain_id == chain.id).order_by(ApprovalStep.step_order)
            )
            steps = steps_res.scalars().all()

        is_final = True
        if steps and leave.current_approval_step < len(steps):
            leave.current_approval_step += 1
            is_final = False
        else:
            leave.status = "approved"
        
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

        if is_final:
            days = get_calendar_days(leave.start_date, leave.end_date)

            await self._create_notification(
                user_id=leave.employee_id,
                title="Leave Request Approved",
                message=f"Your request for {days} day(s) of {leave.leave_type} has been fully approved.",
                ntype="success",
                action_url="/leave-history"
            )
            await self.repo.commit()

            # Trigger calendar syncing once fully approved
            try:
                from app.modules.integrations.calendar_service import CalendarService
                await CalendarService.sync_leave_to_calendar(self.repo.db, leave.id)
            except Exception as cal_err:
                import logging
                logging.getLogger("leaves").error(f"Failed to sync approved leave to calendar: {str(cal_err)}")

        else:
            await self._create_notification(
                user_id=leave.employee_id,
                title="Leave Request Step Approved",
                message=f"Your request for {leave.leave_type} has been approved and moved to step {leave.current_approval_step}.",
                ntype="info",
                action_url="/leave-history"
            )
            await self.repo.commit()

        return {"message": "Leave request approved"}

    async def reject_leave(self, leave_id: int, manager_id: int, is_admin: bool, action: LeaveApprovalAction) -> dict:
        """
        Processes a leave rejection action.
        
        Architectural Flow:
        1. Requires a rejection comment.
        2. Validates authority via the Approval Chain.
        3. Marks the request as 'rejected' (stops the chain immediately).
        4. Restores the deducted days back to the user's Leave Balance.
        5. Logs the action in the AuditLog and sends an in-app notification.
        """
        if not action.comments or not action.comments.strip():
            raise HTTPException(status_code=400, detail="Rejection reason is required")

        row = await self.repo.get_request_with_employee(leave_id)
        if not row:
            raise HTTPException(status_code=404, detail="Leave request not found")

        leave, emp = row
        if leave.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending leaves can be rejected")
        
        await self._validate_approval_authority(leave, emp, manager_id, is_admin, "reject")

        leave.status = "rejected"
        approval = LeaveApproval(
            organization_id=self.repo.organization_id,
            leave_request_id=leave.id,
            manager_id=manager_id,
            action="rejected",
            comments=action.comments
        )
        await self.repo.add_approval(approval)

        # Restore balance (refund the days originally deducted during apply_leave)
        from app.modules.settings.models import LeaveType
        leave_type_obj = await self.repo.db.execute(select(LeaveType).where(
            LeaveType.organization_id == self.repo.organization_id,
            LeaveType.name == leave.leave_type
        ))
        leave_type_record = leave_type_obj.scalar_one_or_none()

        if leave_type_record and leave_type_record.is_paid:
            requested_days = get_calendar_days(leave.start_date, leave.end_date)
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

        days = get_calendar_days(leave.start_date, leave.end_date)
        await self._create_notification(
            user_id=leave.employee_id,
            title="Leave Request Rejected",
            message=f"Your request for {days} day(s) of {leave.leave_type} has been rejected. Reason: {action.comments}",
            ntype="danger",
            action_url="/leave-history"
        )
        await self.repo.commit()

        return {"message": "Leave request rejected"}
