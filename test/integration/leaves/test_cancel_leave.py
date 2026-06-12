"""
Integration tests for PUT /api/leaves/{id}/cancel
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from conftest import auth_headers, make_token


@pytest.mark.asyncio
async def test_cancel_pending_leave(client: AsyncClient, employee_user, employee_token):
    """Employee should be able to cancel their own pending leave."""
    # Apply first
    start = date.today() + timedelta(days=1)
    apply_res = await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(start + timedelta(days=1)),
            "reason": "Will cancel",
        },
        headers=auth_headers(employee_token),
    )
    assert apply_res.status_code == 201

    # Get leave ID from history
    hist_res = await client.get(
        "/api/leaves?status=pending",
        headers=auth_headers(employee_token),
    )
    leave_id = hist_res.json()["leaves"][0]["id"]

    # Cancel
    cancel_res = await client.put(
        f"/api/leaves/{leave_id}/cancel",
        headers=auth_headers(employee_token),
    )
    assert cancel_res.status_code == 200
    assert "cancelled" in cancel_res.json()["message"].lower()


@pytest.mark.asyncio
async def test_cancel_other_users_leave(client: AsyncClient, employee_user, employee_token, create_user):
    """Cannot cancel another user's leave."""
    other = await create_user(name="Other", email="other@company.com")
    other_token = make_token(other)

    # Other user applies
    start = date.today() + timedelta(days=1)
    await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(start),
            "reason": "Other's leave",
        },
        headers=auth_headers(other_token),
    )

    hist = await client.get("/api/leaves?status=pending", headers=auth_headers(other_token))
    leave_id = hist.json()["leaves"][0]["id"]

    # Employee tries to cancel other's leave
    cancel_res = await client.put(
        f"/api/leaves/{leave_id}/cancel",
        headers=auth_headers(employee_token),
    )
    assert cancel_res.status_code == 403


@pytest.mark.asyncio
async def test_cancel_nonexistent_leave(client: AsyncClient, employee_user, employee_token):
    """Non-existent leave should return 404."""
    response = await client.put(
        "/api/leaves/99999/cancel",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 404
