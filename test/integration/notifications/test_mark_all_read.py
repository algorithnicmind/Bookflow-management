"""
Integration tests for PUT /api/notifications/read-all
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers
from app.modules.notifications.models import Notification


@pytest.mark.asyncio
async def test_mark_all_read_success(client: AsyncClient, employee_user, employee_token, db_session):
    """Should mark all notifications as read."""
    for i in range(5):
        notif = Notification(
            user_id=employee_user.id,
            title=f"Notif {i}",
            message=f"Message {i}",
            type="info",
            is_read=False,
        )
        db_session.add(notif)
    await db_session.commit()

    response = await client.put(
        "/api/notifications/read-all",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 200

    # Verify all are read
    list_res = await client.get(
        "/api/notifications",
        headers=auth_headers(employee_token),
    )
    for n in list_res.json()["notifications"]:
        assert n["is_read"] is True


@pytest.mark.asyncio
async def test_mark_all_read_no_notifications(client: AsyncClient, employee_user, employee_token):
    """No notifications should still return 200."""
    response = await client.put(
        "/api/notifications/read-all",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 200
