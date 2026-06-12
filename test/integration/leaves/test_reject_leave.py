"""
Integration tests for PUT /api/leaves/{id}/reject
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
            "reason": "Rejection test",
        },
        headers=auth_headers(employee_token),
    )
    hist = await client.get("/api/leaves?status=pending", headers=auth_headers(employee_token))
    return hist.json()["leaves"][0]["id"]


@pytest.mark.asyncio
async def test_reject_leave_success(client: AsyncClient, employee_user, employee_token, manager_user, manager_token):
    """Manager should reject with reason."""
    leave_id = await _create_pending_leave(client, employee_token)

    response = await client.put(
        f"/api/leaves/{leave_id}/reject",
        json={"comments": "Team is short-staffed"},
        headers=auth_headers(manager_token),
    )
    assert response.status_code == 200
    assert "rejected" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_reject_leave_no_reason(client: AsyncClient, employee_user, employee_token, manager_user, manager_token):
    """Rejection without reason should return 400."""
    leave_id = await _create_pending_leave(client, employee_token, day_offset=3)

    response = await client.put(
        f"/api/leaves/{leave_id}/reject",
        json={"comments": ""},
        headers=auth_headers(manager_token),
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_reject_balance_restored(client: AsyncClient, employee_user, employee_token, manager_user, manager_token):
    """Balance should be restored after rejection."""
    # Get initial balance
    bal1 = await client.get("/api/leaves/balance", headers=auth_headers(employee_token))
    initial = {b["leave_type"]: b["remaining"] for b in bal1.json()["balances"]}

    # Apply for leave (deducts balance)
    leave_id = await _create_pending_leave(client, employee_token, day_offset=5)

    # Reject (should restore)
    await client.put(
        f"/api/leaves/{leave_id}/reject",
        json={"comments": "Rejected"},
        headers=auth_headers(manager_token),
    )

    # Check balance restored
    bal2 = await client.get("/api/leaves/balance", headers=auth_headers(employee_token))
    restored = {b["leave_type"]: b["remaining"] for b in bal2.json()["balances"]}
    assert restored["casual"] == initial["casual"]


@pytest.mark.asyncio
async def test_reject_as_employee_forbidden(client: AsyncClient, employee_user, employee_token, create_user):
    """Employee should not be able to reject leaves."""
    from conftest import make_token

    other = await create_user(name="Other", email="other3@company.com")
    other_token = make_token(other)

    leave_id = await _create_pending_leave(client, other_token, day_offset=7)

    response = await client.put(
        f"/api/leaves/{leave_id}/reject",
        json={"comments": "Not allowed"},
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403
