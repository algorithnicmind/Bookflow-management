"""
Integration tests for POST /api/leaves (apply leave)
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from conftest import auth_headers


def _tomorrow():
    return date.today() + timedelta(days=1)


@pytest.mark.asyncio
async def test_apply_casual_leave(client: AsyncClient, employee_user, employee_token):
    """Employee should be able to apply for casual leave."""
    response = await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(_tomorrow()),
            "end_date": str(_tomorrow() + timedelta(days=2)),
            "reason": "Family trip",
        },
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 201
    assert "submitted" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_apply_sick_leave(client: AsyncClient, employee_user, employee_token):
    """Employee should be able to apply for sick leave."""
    response = await client.post(
        "/api/leaves",
        json={
            "leave_type": "sick",
            "start_date": str(_tomorrow()),
            "end_date": str(_tomorrow()),
            "reason": "Feeling unwell",
        },
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_apply_unpaid_leave(client: AsyncClient, employee_user, employee_token):
    """Unpaid leave should not require balance check."""
    response = await client.post(
        "/api/leaves",
        json={
            "leave_type": "unpaid",
            "start_date": str(_tomorrow() + timedelta(days=10)),
            "end_date": str(_tomorrow() + timedelta(days=12)),
            "reason": "Personal work",
        },
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_apply_leave_past_start(client: AsyncClient, employee_user, employee_token):
    """Start date in the past should return 400."""
    response = await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(date.today() - timedelta(days=1)),
            "end_date": str(date.today()),
            "reason": "Past date test",
        },
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_apply_leave_end_before_start(client: AsyncClient, employee_user, employee_token):
    """End date before start should return 400."""
    response = await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(_tomorrow() + timedelta(days=5)),
            "end_date": str(_tomorrow()),
            "reason": "Wrong dates",
        },
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_apply_leave_overlapping(client: AsyncClient, employee_user, employee_token):
    """Overlapping dates with existing leave should return 400."""
    start = _tomorrow()
    end = start + timedelta(days=2)

    # First application
    await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(end),
            "reason": "First leave",
        },
        headers=auth_headers(employee_token),
    )

    # Overlapping application
    response = await client.post(
        "/api/leaves",
        json={
            "leave_type": "sick",
            "start_date": str(start + timedelta(days=1)),
            "end_date": str(end + timedelta(days=1)),
            "reason": "Overlapping leave",
        },
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 400
    assert "overlapping" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_apply_leave_insufficient_balance(client: AsyncClient, create_user, db_session):
    """Requesting more days than remaining should return 400."""
    from conftest import make_token

    user = await create_user(
        name="Low Balance",
        email="lowbal@company.com",
    )
    token = make_token(user)

    # Use up almost all balance by applying many leaves
    for i in range(4):
        start = _tomorrow() + timedelta(days=i * 5)
        end = start + timedelta(days=2)
        await client.post(
            "/api/leaves",
            json={
                "leave_type": "casual",
                "start_date": str(start),
                "end_date": str(end),
                "reason": f"Leave #{i}",
            },
            headers=auth_headers(token),
        )

    # This one should exceed balance (12 total, used ~12)
    far_start = _tomorrow() + timedelta(days=30)
    response = await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(far_start),
            "end_date": str(far_start + timedelta(days=2)),
            "reason": "Over limit",
        },
        headers=auth_headers(token),
    )
    assert response.status_code == 400
    assert "insufficient" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_apply_leave_no_token(client: AsyncClient, db_session):
    """No authentication should return 401."""
    response = await client.post(
        "/api/leaves",
        json={
            "leave_type": "casual",
            "start_date": str(_tomorrow()),
            "end_date": str(_tomorrow()),
            "reason": "No auth",
        },
    )
    assert response.status_code == 401
