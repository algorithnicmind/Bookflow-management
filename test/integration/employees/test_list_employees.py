"""
Integration tests for GET /api/employees (list employees)
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_list_employees_as_admin(client: AsyncClient, admin_user, admin_token, seeded_db):
    """Admin should see a list of all employees."""
    response = await client.get(
        "/api/employees",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 200
    data = response.json()
    assert "employees" in data
    assert len(data["employees"]) >= 1


@pytest.mark.asyncio
async def test_list_employees_with_search(client: AsyncClient, admin_user, admin_token, seeded_db):
    """Search should filter employees by name."""
    response = await client.get(
        "/api/employees?search=john",
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 200
    employees = response.json()["employees"]
    for emp in employees:
        assert "john" in emp["name"].lower()


@pytest.mark.asyncio
async def test_list_employees_as_employee_forbidden(client: AsyncClient, employee_user, employee_token):
    """Employee should not be able to list all employees."""
    response = await client.get(
        "/api/employees",
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_employees_no_token(client: AsyncClient, db_session):
    """No token should return 401."""
    response = await client.get("/api/employees")
    assert response.status_code == 401
