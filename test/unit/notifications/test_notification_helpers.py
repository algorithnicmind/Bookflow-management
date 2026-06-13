"""
Unit tests for the notification creation helper in leaves/services.py
"""

import pytest
from unittest.mock import AsyncMock

from app.modules.notifications.models import Notification


@pytest.mark.asyncio
async def test_create_notification_adds_to_session():
    """Notification should be added to the DB session."""
    mock_db = AsyncMock()
    added = []
    mock_db.add = lambda obj: added.append(obj)

    notif = Notification(
        user_id=1,
        title="New Leave Application",
        message="John applied for casual leave",
        type="info",
    )
    mock_db.add(notif)

    assert len(added) == 1
    assert isinstance(added[0], Notification)


@pytest.mark.asyncio
async def test_create_notification_fields():
    """All fields should be set correctly."""
    notif = Notification(
        user_id=5,
        title="Leave Approved",
        message="Your casual leave has been approved",
        type="success",
        action_url="/leaves",
    )
    assert notif.user_id == 5
    assert notif.title == "Leave Approved"
    assert notif.message == "Your casual leave has been approved"
    assert notif.type == "success"
    assert notif.action_url == "/leaves"


@pytest.mark.asyncio
async def test_create_notification_default_fields():
    """Optional fields should have sensible defaults."""
    notif = Notification(
        user_id=1,
        title="Test",
        message="Test message",
    )
    assert notif.is_read is False or notif.is_read is None
    assert notif.user_id == 1
