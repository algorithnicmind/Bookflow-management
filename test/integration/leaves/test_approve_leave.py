"""
Integration tests for PUT /api/leaves/{id}/approve
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from conftest import auth_headers


async def _create_pending_leave(client, employee_token, day_offset=1):
    """Helper: create a pending leave and return its ID."""
    start = date.today() + timedelta(days=day_offset)
    await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(start),
            "reason": "Approval test",
        },
        headers=auth_headers(employee_token),
    )
    hist = await client.get("/api/leaves?status=pending", headers=auth_headers(employee_token))
    return hist.json()["leaves"][0]["id"]


@pytest.mark.asyncio
async def test_approve_leave_success(client: AsyncClient, employee_user, employee_token, manager_user, manager_token):
    """Manager should approve a direct report's leave."""
    leave_id = await _create_pending_leave(client, employee_token)

    response = await client.put(
        f"/api/leaves/{leave_id}/approve",
        json={"comments": "Enjoy!"},
        headers=auth_headers(manager_token),
    )
    assert response.status_code == 200
    assert "approved" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_approve_already_approved(client: AsyncClient, employee_user, employee_token, manager_user, manager_token):
    """Cannot approve an already approved leave."""
    leave_id = await _create_pending_leave(client, employee_token, day_offset=3)

    # Approve once
    await client.put(
        f"/api/leaves/{leave_id}/approve",
        json={"comments": "First approval"},
        headers=auth_headers(manager_token),
    )

    # Try again
    response = await client.put(
        f"/api/leaves/{leave_id}/approve",
        json={"comments": "Second attempt"},
        headers=auth_headers(manager_token),
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_approve_as_admin(client: AsyncClient, employee_user, employee_token, admin_user, admin_token):
    """Admin should be able to approve any leave."""
    leave_id = await _create_pending_leave(client, employee_token, day_offset=5)

    response = await client.put(
        f"/api/leaves/{leave_id}/approve",
        json={"comments": "Admin approved"},
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_approve_as_employee_forbidden(client: AsyncClient, employee_user, employee_token, create_user):
    """Employee should not be able to approve leaves."""
    from conftest import make_token

    other = await create_user(name="Other", email="other2@company.com")
    other_token = make_token(other)

    leave_id = await _create_pending_leave(client, other_token, day_offset=7)

    response = await client.put(
        f"/api/leaves/{leave_id}/approve",
        json={"comments": "Not allowed"},
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403
