"""
Integration tests for GET /api/leaves (leave history)
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_get_leave_history_all(client: AsyncClient, employee_user, employee_token):
    """Employee should see all their leave requests."""
    # Apply a leave first
    await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(date.today() + timedelta(days=1)),
            "end_date": str(date.today() + timedelta(days=2)),
            "reason": "Test leave",
        },
        headers=auth_headers(employee_token),
    )

    response = await client.get(
        "/api/leaves?status=all",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 200
    data = response.json()
    assert "leaves" in data
    assert len(data["leaves"]) >= 1


@pytest.mark.asyncio
async def test_get_leave_history_pending(client: AsyncClient, employee_user, employee_token):
    """Filtering by pending should return only pending leaves."""
    await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(date.today() + timedelta(days=1)),
            "end_date": str(date.today() + timedelta(days=1)),
            "reason": "Pending test",
        },
        headers=auth_headers(employee_token),
    )

    response = await client.get(
        "/api/leaves?status=pending",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 200
    for leave in response.json()["leaves"]:
        assert leave["status"] == "pending"


@pytest.mark.asyncio
async def test_get_leave_history_empty(client: AsyncClient, create_user):
    """New employee with no leaves should return empty list."""
    from conftest import make_token

    user = await create_user(
        name="New Hire",
        email="newhire@company.com",
    )
    token = make_token(user)

    response = await client.get(
        "/api/leaves",
        headers=auth_headers(token),
    )
    assert response.status_code == 200
    assert response.json()["leaves"] == []
