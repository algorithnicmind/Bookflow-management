"""
Unit tests for app.modules.leaves.services — LeaveService
The most critical service with the most business rules.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date, timedelta
from fastapi import HTTPException

from app.modules.leaves.services import LeaveService
from app.modules.leaves.schemas import LeaveApplication, LeaveApprovalAction


from unittest.mock import AsyncMock, MagicMock, patch

def _make_service():
    """Create a LeaveService with a mocked repository."""
    repo = AsyncMock()
    repo.organization_id = 1
    repo.db = AsyncMock()
    
    # Setup default mock for db.execute to prevent coroutine AttributeError
    def mock_execute(*args, **kwargs):
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_result.scalars.return_value.all.return_value = []
        return mock_result
        
    repo.db.execute.side_effect = mock_execute
    
    return LeaveService(repo), repo

pytestmark = pytest.mark.filterwarnings("ignore::RuntimeWarning")
patcher = patch("app.modules.leaves.services.AuditLogService.log_action", new_callable=AsyncMock)
patcher.start()


def _tomorrow():
    return date.today() + timedelta(days=1)


# ─── apply_leave ──────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_apply_leave_success():
    """Valid leave application should succeed."""
    service, repo = _make_service()
    repo.get_overlapping_requests.return_value = []
    balance = MagicMock(total_days=12, used_days=0)
    repo.get_balance.return_value = balance
    repo.create_request.return_value = MagicMock(id=1)

    # Mock _get_employee to return employee without manager
    mock_emp = MagicMock(id=1, name="John", manager_id=None)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_emp

    # Mock db.execute for holiday fetch
    mock_holiday_result = MagicMock()
    mock_holiday_result.all.return_value = []
    
    # Mock db.execute to return employee first, then holidays
    repo.db.execute.side_effect = [mock_result, mock_holiday_result]

    req = LeaveApplication(
        leave_type="casual",
        start_date=_tomorrow(),
        end_date=_tomorrow() + timedelta(days=2),
        reason="Family trip",
    )

    result = await service.apply_leave(1, req)
    assert "submitted successfully" in result["message"].lower()
    assert balance.used_days == 3  # Deducted


@pytest.mark.asyncio
async def test_apply_leave_start_date_in_past():
    """Start date in the past raises 400."""
    service, repo = _make_service()

    req = LeaveApplication(
        leave_type="casual",
        start_date=date.today() - timedelta(days=1),
        end_date=date.today(),
        reason="Past leave",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.apply_leave(1, req)
    assert exc_info.value.status_code == 400
    assert "past" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_apply_leave_end_before_start():
    """End date before start date raises 400."""
    service, repo = _make_service()

    req = LeaveApplication(
        leave_type="casual",
        start_date=_tomorrow() + timedelta(days=2),
        end_date=_tomorrow(),
        reason="Invalid range",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.apply_leave(1, req)
    assert exc_info.value.status_code == 400
    assert "end date" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_apply_leave_overlapping_dates():
    """Overlapping leave request raises 400."""
    service, repo = _make_service()
    repo.get_overlapping_requests.return_value = [MagicMock()]  # Existing overlap

    req = LeaveApplication(
        leave_type="casual",
        start_date=_tomorrow(),
        end_date=_tomorrow() + timedelta(days=1),
        reason="Overlap test",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.apply_leave(1, req)
    assert exc_info.value.status_code == 400
    assert "overlapping" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_apply_leave_insufficient_balance():
    """Insufficient balance raises 400."""
    service, repo = _make_service()
    repo.get_overlapping_requests.return_value = []
    balance = MagicMock(total_days=12, used_days=11)  # Only 1 day remaining
    repo.get_balance.return_value = balance

    mock_holiday_result = MagicMock()
    mock_holiday_result.all.return_value = []
    repo.db.execute.return_value = mock_holiday_result

    req = LeaveApplication(
        leave_type="casual",
        start_date=_tomorrow(),
        end_date=_tomorrow() + timedelta(days=2),  # Requesting 3 days
        reason="Not enough",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.apply_leave(1, req)
    assert exc_info.value.status_code == 400
    assert "insufficient" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_apply_leave_no_balance_record():
    """No balance record for this type/year raises 400."""
    service, repo = _make_service()
    repo.get_overlapping_requests.return_value = []
    repo.get_balance.return_value = None

    mock_holiday_result = MagicMock()
    mock_holiday_result.all.return_value = []
    repo.db.execute.return_value = mock_holiday_result

    req = LeaveApplication(
        leave_type="casual",
        start_date=_tomorrow(),
        end_date=_tomorrow(),
        reason="No record",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.apply_leave(1, req)
    assert exc_info.value.status_code == 400
    assert "balance record" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_apply_unpaid_leave_skips_balance_check():
    """Unpaid leave should not check or deduct balance."""
    service, repo = _make_service()
    repo.get_overlapping_requests.return_value = []
    repo.create_request.return_value = MagicMock(id=1)

    mock_emp = MagicMock(id=1, name="John", manager_id=None)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_emp
    
    mock_holiday_result = MagicMock()
    mock_holiday_result.all.return_value = []
    
    repo.db.execute.side_effect = [mock_holiday_result, mock_result]

    req = LeaveApplication(
        leave_type="unpaid",
        start_date=_tomorrow(),
        end_date=_tomorrow() + timedelta(days=1),
        reason="Unpaid leave",
    )

    result = await service.apply_leave(1, req)
    assert "submitted successfully" in result["message"].lower()
    repo.get_balance.assert_not_awaited()


@pytest.mark.asyncio
async def test_apply_leave_deducts_balance():
    """Balance used_days should be incremented by requested days."""
    service, repo = _make_service()
    repo.get_overlapping_requests.return_value = []
    balance = MagicMock(total_days=12, used_days=2)
    repo.get_balance.return_value = balance
    repo.create_request.return_value = MagicMock(id=1)

    mock_emp = MagicMock(id=1, name="John", manager_id=None)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_emp
    
    mock_holiday_result = MagicMock()
    mock_holiday_result.all.return_value = []
    
    repo.db.execute.side_effect = [mock_holiday_result, mock_result]

    req = LeaveApplication(
        leave_type="casual",
        start_date=_tomorrow(),
        end_date=_tomorrow() + timedelta(days=2),  # 3 days
        reason="Deduction test",
    )

    await service.apply_leave(1, req)
    assert balance.used_days == 5  # 2 + 3


# ─── cancel_leave ─────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_cancel_leave_success():
    """Cancelling own pending leave should succeed and restore balance."""
    service, repo = _make_service()
    leave = MagicMock(id=1, employee_id=1, status="pending",
                      leave_type="casual",
                      start_date=_tomorrow(),
                      end_date=_tomorrow() + timedelta(days=1))
    repo.get_request_by_id.return_value = leave
    balance = MagicMock(used_days=5)
    repo.get_balance.return_value = balance

    mock_emp = MagicMock(id=1, name="John", manager_id=None)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_emp
    repo.db.execute.return_value = mock_result

    await service.cancel_leave(1, employee_id=1)
    assert leave.status == "cancelled"
    assert balance.used_days == 3  # 5 - 2 days


@pytest.mark.asyncio
async def test_cancel_leave_not_found():
    """Non-existent leave raises 404."""
    service, repo = _make_service()
    repo.get_request_by_id.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        await service.cancel_leave(99999, employee_id=1)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_cancel_leave_not_owner():
    """Cancelling another user's leave raises 403."""
    service, repo = _make_service()
    leave = MagicMock(id=1, employee_id=2, status="pending")
    repo.get_request_by_id.return_value = leave

    with pytest.raises(HTTPException) as exc_info:
        await service.cancel_leave(1, employee_id=1)
    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_cancel_leave_not_pending():
    """Cancelling non-pending leave raises 400."""
    service, repo = _make_service()
    leave = MagicMock(id=1, employee_id=1, status="approved")
    repo.get_request_by_id.return_value = leave

    with pytest.raises(HTTPException) as exc_info:
        await service.cancel_leave(1, employee_id=1)
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_cancel_unpaid_leave_no_balance_change():
    """Cancelling unpaid leave should not modify balance."""
    service, repo = _make_service()
    leave = MagicMock(id=1, employee_id=1, status="pending",
                      leave_type="unpaid",
                      start_date=_tomorrow(),
                      end_date=_tomorrow())
    repo.get_request_by_id.return_value = leave

    mock_emp = MagicMock(id=1, name="John", manager_id=None)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_emp
    repo.db.execute.return_value = mock_result

    await service.cancel_leave(1, employee_id=1)
    assert leave.status == "cancelled"
    repo.get_balance.assert_not_awaited()


# ─── approve_leave ────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_approve_leave_success():
    """Manager approves direct report's pending leave."""
    service, repo = _make_service()
    leave = MagicMock(id=1, employee_id=2, status="pending",
                      start_date=_tomorrow(),
                      end_date=_tomorrow() + timedelta(days=1),
                      leave_type="casual")
    emp = MagicMock(id=2, manager_id=1, name="John")
    repo.get_request_with_employee.return_value = (leave, emp)

    added_objects = []
    repo.db.add = lambda obj: added_objects.append(obj)

    action = LeaveApprovalAction(comments="Enjoy!")
    result = await service.approve_leave(1, manager_id=1, is_admin=False, action=action)
    assert leave.status == "approved"
    assert "approved" in result["message"].lower()


@pytest.mark.asyncio
async def test_approve_leave_not_found():
    """Non-existent leave raises 404."""
    service, repo = _make_service()
    repo.get_request_with_employee.return_value = None

    action = LeaveApprovalAction(comments="OK")
    with pytest.raises(HTTPException) as exc_info:
        await service.approve_leave(99999, manager_id=1, is_admin=False, action=action)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_approve_leave_not_pending():
    """Already approved leave raises 400."""
    service, repo = _make_service()
    leave = MagicMock(id=1, status="approved")
    emp = MagicMock(id=2, manager_id=1)
    repo.get_request_with_employee.return_value = (leave, emp)

    action = LeaveApprovalAction(comments="OK")
    with pytest.raises(HTTPException) as exc_info:
        await service.approve_leave(1, manager_id=1, is_admin=False, action=action)
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_approve_leave_not_direct_report():
    """Manager cannot approve non-report's leave."""
    service, repo = _make_service()
    leave = MagicMock(id=1, status="pending")
    emp = MagicMock(id=2, manager_id=5)  # Reports to manager 5, not 1
    repo.get_request_with_employee.return_value = (leave, emp)

    action = LeaveApprovalAction(comments="OK")
    with pytest.raises(HTTPException) as exc_info:
        await service.approve_leave(1, manager_id=1, is_admin=False, action=action)
    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_approve_leave_admin_bypass():
    """Admin can approve any employee's leave."""
    service, repo = _make_service()
    leave = MagicMock(id=1, employee_id=2, status="pending",
                      start_date=_tomorrow(), end_date=_tomorrow(),
                      leave_type="casual")
    emp = MagicMock(id=2, manager_id=5)  # Reports to someone else
    repo.get_request_with_employee.return_value = (leave, emp)
    repo.db.add = MagicMock()

    action = LeaveApprovalAction(comments="Admin approved")
    await service.approve_leave(1, manager_id=1, is_admin=True, action=action)
    assert leave.status == "approved"


# ─── reject_leave ─────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_reject_leave_success():
    """Reject with reason should change status and restore balance."""
    service, repo = _make_service()
    leave = MagicMock(id=1, employee_id=2, status="pending",
                      leave_type="casual",
                      start_date=_tomorrow(),
                      end_date=_tomorrow() + timedelta(days=2))
    emp = MagicMock(id=2, manager_id=1, name="John")
    repo.get_request_with_employee.return_value = (leave, emp)
    balance = MagicMock(used_days=5)
    repo.get_balance.return_value = balance
    repo.db.add = MagicMock()

    action = LeaveApprovalAction(comments="Team is short-staffed")
    result = await service.reject_leave(1, manager_id=1, is_admin=False, action=action)

    assert leave.status == "rejected"
    assert balance.used_days == 2  # 5 - 3 days restored
    assert "rejected" in result["message"].lower()


@pytest.mark.asyncio
async def test_reject_leave_no_reason():
    """Empty rejection reason raises 400."""
    service, repo = _make_service()

    action = LeaveApprovalAction(comments="")
    with pytest.raises(HTTPException) as exc_info:
        await service.reject_leave(1, manager_id=1, is_admin=False, action=action)
    assert exc_info.value.status_code == 400
    assert "reason is required" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_reject_leave_whitespace_only_reason():
    """Whitespace-only rejection reason raises 400."""
    service, repo = _make_service()

    action = LeaveApprovalAction(comments="   ")
    with pytest.raises(HTTPException) as exc_info:
        await service.reject_leave(1, manager_id=1, is_admin=False, action=action)
    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_reject_unpaid_no_balance_change():
    """Rejecting unpaid leave should not modify balance."""
    service, repo = _make_service()
    leave = MagicMock(id=1, employee_id=2, status="pending",
                      leave_type="unpaid",
                      start_date=_tomorrow(),
                      end_date=_tomorrow())
    emp = MagicMock(id=2, manager_id=1, name="John")
    repo.get_request_with_employee.return_value = (leave, emp)
    repo.db.add = MagicMock()

    action = LeaveApprovalAction(comments="No unpaid allowed")
    await service.reject_leave(1, manager_id=1, is_admin=False, action=action)

    assert leave.status == "rejected"
    repo.get_balance.assert_not_awaited()


# Deleted get_business_days tests since method is moved to utils
