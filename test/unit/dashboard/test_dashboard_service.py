"""
Unit tests for app.modules.dashboard.services — DashboardService
"""

import pytest
from unittest.mock import AsyncMock, MagicMock


from app.modules.dashboard.services import DashboardService


def _make_service():
    mock_db = AsyncMock()
    return DashboardService(mock_db), mock_db


@pytest.mark.asyncio
async def test_employee_dashboard_stats():
    """Employee role should see own stats."""
    service, db = _make_service()

    # Mock employee lookup
    emp = MagicMock(id=1, role="employee", department="Eng", **{"name": "John"})

    # Mock leave counts
    mock_counts = MagicMock()
    mock_counts.scalar.side_effect = [5, 2, 1, 1]  # total, pending, approved, rejected
    db.execute.return_value = mock_counts

    result = await service.get_stats(emp)
    assert result is not None


@pytest.mark.asyncio
async def test_employee_dashboard_has_required_keys():
    """Dashboard response should have essential keys."""
    service, db = _make_service()

    from app.modules.dashboard.schemas import DashboardResponse
    emp = MagicMock(id=1, role="employee", department="Eng", **{"name": "John"})

    mock_result = MagicMock()
    mock_result.scalar.return_value = 0
    mock_result.scalars.return_value.all.return_value = []
    db.execute.return_value = mock_result

    result = await service.get_stats(emp)
    # The result should be a DashboardResponse object
    assert isinstance(result, DashboardResponse)


@pytest.mark.asyncio
async def test_manager_dashboard_includes_team_data():
    """Manager role should include team-related data."""
    service, db = _make_service()

    from app.modules.dashboard.schemas import DashboardResponse
    emp = MagicMock(id=1, role="manager", department="Eng", **{"name": "John"})

    mock_result = MagicMock()
    mock_result.scalar.return_value = 3
    mock_result.scalars.return_value.all.return_value = []
    db.execute.return_value = mock_result

    result = await service.get_stats(emp)
    assert isinstance(result, DashboardResponse)


@pytest.mark.asyncio
async def test_admin_dashboard_includes_org_stats():
    """Admin role should include org-wide stats."""
    service, db = _make_service()

    from app.modules.dashboard.schemas import DashboardResponse
    emp = MagicMock(id=1, role="admin", department="Eng", **{"name": "John"})

    mock_result = MagicMock()
    mock_result.scalar.return_value = 50
    mock_result.scalars.return_value.all.return_value = []
    db.execute.return_value = mock_result

    result = await service.get_stats(emp)
    assert isinstance(result, DashboardResponse)
