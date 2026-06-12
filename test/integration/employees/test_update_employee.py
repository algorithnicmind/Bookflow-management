"""
Integration tests for PUT /api/employees/{id}
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_update_employee_name(client: AsyncClient, admin_user, admin_token, employee_user):
    """Admin should be able to update employee name."""
    response = await client.put(
        f"/api/employees/{employee_user.id}",
        json={"name": "Updated Name"},
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_update_employee_role(client: AsyncClient, admin_user, admin_token, employee_user):
    """Admin should be able to update employee role."""
    response = await client.put(
        f"/api/employees/{employee_user.id}",
        json={"role": "manager"},
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_update_employee_not_found(client: AsyncClient, admin_user, admin_token):
    """Non-existent employee should return 404."""
    response = await client.put(
        "/api/employees/99999",
        json={"name": "Ghost"},
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_employee_as_employee_forbidden(client: AsyncClient, employee_user, employee_token):
    """Employee should not be able to update other employees."""
    response = await client.put(
        f"/api/employees/{employee_user.id}",
        json={"name": "Hacker"},
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403
