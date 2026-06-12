"""
Integration tests for GET /api/leaves/balance
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_get_balance_success(client: AsyncClient, employee_user, employee_token):
    """Employee should see their leave balances."""
    response = await client.get(
        "/api/leaves/balance",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 200
    data = response.json()
    assert "balances" in data
    assert len(data["balances"]) == 5  # 5 leave types


@pytest.mark.asyncio
async def test_balance_after_apply(client: AsyncClient, employee_user, employee_token):
    """Balance should decrease after applying for leave."""
    # Get initial balance
    res1 = await client.get("/api/leaves/balance", headers=auth_headers(employee_token))
    initial = {b["leave_type"]: b["remaining"] for b in res1.json()["balances"]}

    # Apply for 2-day casual leave
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=1)
    await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(end),
            "reason": "Balance test",
        },
        headers=auth_headers(employee_token),
    )

    # Check new balance
    res2 = await client.get("/api/leaves/balance", headers=auth_headers(employee_token))
    updated = {b["leave_type"]: b["remaining"] for b in res2.json()["balances"]}

    assert updated["casual"] < initial["casual"]


@pytest.mark.asyncio
async def test_balance_no_token(client: AsyncClient, db_session):
    """No token should return 401."""
    response = await client.get("/api/leaves/balance")
    assert response.status_code == 401
