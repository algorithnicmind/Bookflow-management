"""
Integration tests for DELETE /api/employees/{id}
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_deactivate_employee_success(client: AsyncClient, admin_user, admin_token, employee_user):
    """Admin should be able to deactivate an employee."""
    response = await client.delete(
        f"/api/employees/{employee_user.id}",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_deactivate_self(client: AsyncClient, admin_user, admin_token):
    """Admin should not be able to deactivate themselves."""
    response = await client.delete(
        f"/api/employees/{admin_user.id}",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_deactivate_not_found(client: AsyncClient, admin_user, admin_token):
    """Non-existent employee should return 404."""
    response = await client.delete(
        "/api/employees/99999",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_deactivate_as_employee_forbidden(client: AsyncClient, employee_user, employee_token, manager_user):
    """Employee should not be able to deactivate others."""
    response = await client.delete(
        f"/api/employees/{manager_user.id}",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403
