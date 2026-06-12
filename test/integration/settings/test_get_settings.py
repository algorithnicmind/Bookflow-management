"""
Integration tests for GET /api/settings
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_get_settings_super_admin(client: AsyncClient, super_admin, super_admin_token):
    """Super admin should see all settings."""
    response = await client.get(
        "/api/settings",
        headers=auth_headers(super_admin_token),
    )
    assert response.status_code == 200
    data = response.json()
    assert "max_casual_leave" in data or "settings" in data


@pytest.mark.asyncio
async def test_get_settings_admin_forbidden(client: AsyncClient, admin_user, admin_token):
    """Admin should not access settings."""
    response = await client.get(
        "/api/settings",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_settings_employee_forbidden(client: AsyncClient, employee_user, employee_token):
    """Employee should not access settings."""
    response = await client.get(
        "/api/settings",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403
