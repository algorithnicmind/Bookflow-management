"""
Integration tests for GET /api/dashboard/stats
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_employee_dashboard(client: AsyncClient, employee_user, employee_token):
    """Employee should see their dashboard stats."""
    response = await client.get(
        "/api/dashboard/stats",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data or "role" in data


@pytest.mark.asyncio
async def test_manager_dashboard(client: AsyncClient, manager_user, manager_token, seeded_db):
    """Manager should see team-related data."""
    response = await client.get(
        "/api/dashboard/stats",
        headers=auth_headers(manager_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_admin_dashboard(client: AsyncClient, admin_user, admin_token, seeded_db):
    """Admin should see org-wide stats."""
    response = await client.get(
        "/api/dashboard/stats",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_dashboard_no_token(client: AsyncClient, db_session):
    """No token should return 401."""
    response = await client.get("/api/dashboard/stats")
    assert response.status_code == 401
