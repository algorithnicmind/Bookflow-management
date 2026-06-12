"""
Integration tests for GET /api/notifications
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers
from app.modules.notifications.models import Notification


@pytest.mark.asyncio
async def test_list_notifications_success(client: AsyncClient, employee_user, employee_token, db_session):
    """Employee should see their notifications."""
    # Seed some notifications
    for i in range(3):
        notif = Notification(
            user_id=employee_user.id,
            title=f"Test Notification {i}",
            message=f"Message {i}",
            type="info",
            is_read=False,
        )
        db_session.add(notif)
    await db_session.commit()

    response = await client.get(
        "/api/notifications",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 200
    data = response.json()
    assert "notifications" in data
    assert len(data["notifications"]) == 3


@pytest.mark.asyncio
async def test_list_notifications_own_only(client: AsyncClient, employee_user, employee_token, manager_user, db_session):
    """Should only see own notifications."""
    # Create notification for manager (not employee)
    notif = Notification(
        user_id=manager_user.id,
        title="Manager Only",
        message="Not for employee",
        type="info",
    )
    db_session.add(notif)
    await db_session.commit()

    response = await client.get(
        "/api/notifications",
        headers=auth_headers(employee_token),
    )
    data = response.json()
    for n in data["notifications"]:
        assert n["user_id"] != manager_user.id or "user_id" not in n
