"""
Unit tests for app.modules.leaves.repositories — LeaveRepository
"""

import pytest
from unittest.mock import AsyncMock, MagicMock

from app.modules.leaves.repositories import LeaveRepository


def _make_repo():
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    return LeaveRepository(mock_db, organization_id=1), mock_db


@pytest.mark.asyncio
async def test_get_overlapping_requests_found():
    """Should return overlapping requests."""
    repo, db = _make_repo()
    overlap = MagicMock(id=1)
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [overlap]
    db.execute.return_value = mock_result

    from datetime import date, timedelta
    results = await repo.get_overlapping_requests(
        employee_id=1,
        start_date=date.today(),
        end_date=date.today() + timedelta(days=2),
    )
    assert len(results) == 1


@pytest.mark.asyncio
async def test_get_overlapping_requests_none():
    """Should return empty list when no overlap."""
    repo, db = _make_repo()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    db.execute.return_value = mock_result

    from datetime import date, timedelta
    results = await repo.get_overlapping_requests(
        employee_id=1,
        start_date=date.today() + timedelta(days=30),
        end_date=date.today() + timedelta(days=32),
    )
    assert len(results) == 0


@pytest.mark.asyncio
async def test_get_balance_found():
    """Should return balance when it exists."""
    repo, db = _make_repo()
    balance = MagicMock(leave_type="casual", total_days=12, used_days=3)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = balance
    db.execute.return_value = mock_result

    result = await repo.get_balance(employee_id=1, leave_type="casual", year=2026)
    assert result == balance


@pytest.mark.asyncio
async def test_get_balance_not_found():
    """Should return None when no balance record exists."""
    repo, db = _make_repo()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    db.execute.return_value = mock_result

    result = await repo.get_balance(employee_id=1, leave_type="casual", year=2026)
    assert result is None


@pytest.mark.asyncio
async def test_create_request():
    """create_request should add to session and flush."""
    repo, db = _make_repo()
    leave_req = MagicMock()

    await repo.create_request(leave_req)
    db.add.assert_called_once_with(leave_req)
    db.flush.assert_awaited_once()


@pytest.mark.asyncio
async def test_get_request_by_id():
    """Should return leave request by ID."""
    repo, db = _make_repo()
    leave = MagicMock(id=1)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = leave
    db.execute.return_value = mock_result

    result = await repo.get_request_by_id(1)
    assert result == leave
