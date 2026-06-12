"""
Integration tests for PUT /api/notifications/{id}/read
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers
from app.modules.notifications.models import Notification


@pytest.mark.asyncio
async def test_mark_notification_read(client: AsyncClient, employee_user, employee_token, db_session):
    """Should mark a single notification as read."""
    notif = Notification(
        user_id=employee_user.id,
        title="Read Me",
        message="Mark as read test",
        type="info",
        is_read=False,
    )
    db_session.add(notif)
    await db_session.commit()
    await db_session.refresh(notif)

    response = await client.put(
        f"/api/notifications/{notif.id}/read",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_mark_nonexistent_notification(client: AsyncClient, employee_user, employee_token):
    """Non-existent notification should return 404."""
    response = await client.put(
        "/api/notifications/99999/read",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 404
