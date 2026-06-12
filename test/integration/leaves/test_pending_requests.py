"""
Integration tests for GET /api/leaves/pending
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_pending_as_manager(client: AsyncClient, employee_user, employee_token, manager_user, manager_token):
    """Manager should see direct reports' pending requests."""
    # Employee applies for leave
    start = date.today() + timedelta(days=1)
    await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(start),
            "reason": "Manager pending test",
        },
        headers=auth_headers(employee_token),
    )

    # Manager checks pending
    response = await client.get(
        "/api/leaves/pending",
        headers=auth_headers(manager_token),
    )
    assert response.status_code == 200
    assert "pending" in response.json()
    assert len(response.json()["pending"]) >= 1


@pytest.mark.asyncio
async def test_pending_as_admin(client: AsyncClient, employee_user, employee_token, admin_user, admin_token):
    """Admin should see all pending requests."""
    start = date.today() + timedelta(days=1)
    await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(start),
            "reason": "Admin pending test",
        },
        headers=auth_headers(employee_token),
    )

    response = await client.get(
        "/api/leaves/pending",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 200
    assert len(response.json()["pending"]) >= 1


@pytest.mark.asyncio
async def test_pending_as_employee_forbidden(client: AsyncClient, employee_user, employee_token):
    """Employee should not see the pending queue."""
    response = await client.get(
        "/api/leaves/pending",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403
