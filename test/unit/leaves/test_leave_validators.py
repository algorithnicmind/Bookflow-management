"""
Unit tests for Leave schema validation (Pydantic models).
"""

import pytest
from datetime import date, timedelta
from pydantic import ValidationError

from app.modules.leaves.schemas import LeaveApplication


def _tomorrow():
    return date.today() + timedelta(days=1)


def test_valid_leave_application():
    """Complete valid payload should create model."""
    req = LeaveApplication(
        leave_type="casual",
        start_date=_tomorrow(),
        end_date=_tomorrow() + timedelta(days=2),
        reason="Test reason",
    )
    assert req.leave_type == "casual"
    assert req.reason == "Test reason"


def test_leave_type_casual():
    """'casual' should be a valid leave type."""
    req = LeaveApplication(
        leave_type="casual",
        start_date=_tomorrow(),
        end_date=_tomorrow(),
        reason="test",
    )
    assert req.leave_type == "casual"


def test_leave_type_sick():
    """'sick' should be a valid leave type."""
    req = LeaveApplication(
        leave_type="sick",
        start_date=_tomorrow(),
        end_date=_tomorrow(),
        reason="test",
    )
    assert req.leave_type == "sick"


def test_leave_type_earned():
    """'earned' should be a valid leave type."""
    req = LeaveApplication(
        leave_type="earned",
        start_date=_tomorrow(),
        end_date=_tomorrow(),
        reason="test",
    )
    assert req.leave_type == "earned"


def test_leave_type_unpaid():
    """'unpaid' should be a valid leave type."""
    req = LeaveApplication(
        leave_type="unpaid",
        start_date=_tomorrow(),
        end_date=_tomorrow(),
        reason="test",
    )
    assert req.leave_type == "unpaid"


def test_leave_type_maternity():
    """'maternity' should be a valid leave type."""
    req = LeaveApplication(
        leave_type="maternity",
        start_date=_tomorrow(),
        end_date=_tomorrow() + timedelta(days=10),
        reason="test",
    )
    assert req.leave_type == "maternity"


def test_leave_type_miscarriage():
    """'miscarriage' should be a valid leave type."""
    req = LeaveApplication(
        leave_type="miscarriage",
        start_date=_tomorrow(),
        end_date=_tomorrow() + timedelta(days=5),
        reason="test",
    )
    assert req.leave_type == "miscarriage"


def test_leave_type_invalid():
    """Invalid leave type should raise ValidationError."""
    with pytest.raises(ValidationError):
        LeaveApplication(
            leave_type="vacation",  # Not a valid type
            start_date=_tomorrow(),
            end_date=_tomorrow(),
            reason="test",
        )


def test_leave_application_missing_reason():
    """Missing reason should raise ValidationError."""
    with pytest.raises(ValidationError):
        LeaveApplication(
            leave_type="casual",
            start_date=_tomorrow(),
            end_date=_tomorrow(),
            # reason is missing
        )


def test_leave_application_missing_dates():
    """Missing dates should raise ValidationError."""
    with pytest.raises(ValidationError):
        LeaveApplication(
            leave_type="casual",
            reason="test",
            # dates are missing
        )
