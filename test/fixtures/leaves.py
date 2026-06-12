"""
Factory functions for creating leave-related test data.
"""

from datetime import date, datetime, timedelta
from app.modules.leaves.models import LeaveRequest, LeaveBalance, LeaveApproval


def build_leave_request(
    employee_id: int = 1,
    leave_type: str = "casual",
    start_date: date = None,
    end_date: date = None,
    reason: str = "Test leave request",
    status: str = "pending",
    id: int = None,
) -> LeaveRequest:
    """Build a LeaveRequest object."""
    if start_date is None:
        start_date = date.today() + timedelta(days=1)
    if end_date is None:
        end_date = start_date + timedelta(days=2)

    lr = LeaveRequest(
        employee_id=employee_id,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        status=status,
    )
    if id is not None:
        lr.id = id
    return lr


def build_leave_balance(
    employee_id: int = 1,
    leave_type: str = "casual",
    total_days: int = 12,
    used_days: int = 0,
    year: int = None,
) -> LeaveBalance:
    """Build a LeaveBalance object."""
    if year is None:
        year = datetime.now().year
    return LeaveBalance(
        employee_id=employee_id,
        leave_type=leave_type,
        total_days=total_days,
        used_days=used_days,
        year=year,
    )


def build_leave_approval(
    leave_request_id: int = 1,
    manager_id: int = 1,
    action: str = "approved",
    comments: str = "Approved",
) -> LeaveApproval:
    """Build a LeaveApproval object."""
    return LeaveApproval(
        leave_request_id=leave_request_id,
        manager_id=manager_id,
        action=action,
        comments=comments,
    )
