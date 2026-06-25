"""
Unit tests for app.modules.settings.services — SettingsService
"""

import pytest
from unittest.mock import AsyncMock, MagicMock

from app.modules.settings.services import SettingsService
from app.modules.settings.schemas import SettingsUpdate


def _make_service():
    mock_db = AsyncMock()
    return SettingsService(mock_db, organization_id=1), mock_db


@pytest.mark.asyncio
async def test_get_settings_existing():
    """Should return existing settings."""
    service, db = _make_service()
    settings_obj = MagicMock(
        max_casual_leave=12, max_sick_leave=12,
        max_earned_leave=18, max_maternity_leave=182,
        max_miscarriage_leave=42,
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = settings_obj
    db.execute.return_value = mock_result

    result = await service.get_settings()
    assert result.max_casual_leave == 12
    assert result.max_sick_leave == 12


@pytest.mark.asyncio
async def test_get_settings_creates_default():
    """Should create default settings when none exist."""
    service, db = _make_service()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None  # No settings
    db.execute.return_value = mock_result

    added = []
    db.add = lambda obj: added.append(obj)

    result = await service.get_settings()
    assert len(added) == 1
    assert result is added[0]
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_settings_partial():
    """Should only update specified fields."""
    service, db = _make_service()
    settings_obj = MagicMock(
        max_casual_leave=12, max_sick_leave=12,
        max_earned_leave=18, max_maternity_leave=182,
        max_miscarriage_leave=42,
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = settings_obj
    db.execute.return_value = mock_result

    update = SettingsUpdate(max_casual_leave=15)
    await service.update_settings(update)
    assert settings_obj.max_casual_leave == 15
    # Other fields unchanged
    assert settings_obj.max_sick_leave == 12


@pytest.mark.asyncio
async def test_update_settings_all_fields():
    """Should update all fields when all are provided."""
    service, db = _make_service()
    settings_obj = MagicMock(
        max_casual_leave=12, max_sick_leave=12,
        max_earned_leave=18, max_maternity_leave=182,
        max_miscarriage_leave=42,
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = settings_obj
    db.execute.return_value = mock_result

    update = SettingsUpdate(
        max_casual_leave=20,
        max_sick_leave=15,
        max_earned_leave=25,
        max_maternity_leave=200,
        max_miscarriage_leave=50,
    )
    await service.update_settings(update)
    assert settings_obj.max_casual_leave == 20
    assert settings_obj.max_sick_leave == 15
    assert settings_obj.max_earned_leave == 25
    assert settings_obj.max_maternity_leave == 200
    assert settings_obj.max_miscarriage_leave == 50
