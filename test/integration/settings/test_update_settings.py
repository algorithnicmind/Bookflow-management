"""
Integration tests for PUT /api/settings
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_update_settings_success(client: AsyncClient, super_admin, super_admin_token):
    """Super admin should update settings."""
    response = await client.put(
        "/api/settings",
        json={"max_casual_leave": 15},
        headers=auth_headers(super_admin_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_update_all_settings(client: AsyncClient, super_admin, super_admin_token):
    """Should update all 5 leave limit fields."""
    response = await client.put(
        "/api/settings",
        json={
            "max_casual_leave": 20,
            "max_sick_leave": 15,
            "max_earned_leave": 25,
            "max_maternity_leave": 200,
            "max_miscarriage_leave": 50,
        },
        headers=auth_headers(super_admin_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_update_settings_admin_forbidden(client: AsyncClient, admin_user, admin_token):
    """Admin should not be able to update settings."""
    response = await client.put(
        "/api/settings",
        json={"max_casual_leave": 15},
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_settings_employee_forbidden(client: AsyncClient, employee_user, employee_token):
    """Employee should not update settings."""
    response = await client.put(
        "/api/settings",
        json={"max_casual_leave": 100},
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403
