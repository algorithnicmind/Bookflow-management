"""
Integration tests for POST /api/employees (create employee)
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_create_employee_success(client: AsyncClient, admin_user, admin_token):
    """Admin should be able to create a new employee."""
    response = await client.post(
        "/api/employees",
        json={
            "name": "New Employee",
            "email": "newguy@company.com",
            "password": "password123",
            "role": "employee",
            "department": "Engineering",
            "gender": "male",
        },
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 201
    data = response.json()
    assert data["employee"]["name"] == "New Employee"
    assert data["employee"]["email"] == "newguy@company.com"


@pytest.mark.asyncio
async def test_create_employee_with_manager(client: AsyncClient, admin_user, admin_token, manager_user):
    """Creating employee with manager_id should set the relationship."""
    response = await client.post(
        "/api/employees",
        json={
            "name": "Managed Employee",
            "email": "managed@company.com",
            "password": "password123",
            "role": "employee",
            "department": "Engineering",
            "manager_id": manager_user.id,
        },
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 201
    assert response.json()["employee"]["manager_id"] == manager_user.id


@pytest.mark.asyncio
async def test_create_employee_duplicate_email(client: AsyncClient, admin_user, admin_token, seeded_db):
    """Duplicate email should return 409."""
    response = await client.post(
        "/api/employees",
        json={
            "name": "Duplicate",
            "email": "john@company.com",  # Already exists
            "password": "password123",
            "role": "employee",
            "department": "Eng",
        },
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_create_employee_as_employee_forbidden(client: AsyncClient, employee_user, employee_token):
    """Employee should not be able to create other employees."""
    response = await client.post(
        "/api/employees",
        json={
            "name": "Unauthorized",
            "email": "unauth@company.com",
            "password": "password123",
            "role": "employee",
            "department": "Eng",
        },
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_employee_as_manager_forbidden(client: AsyncClient, manager_user, manager_token):
    """Manager should not be able to create employees."""
    response = await client.post(
        "/api/employees",
        json={
            "name": "Unauthorized",
            "email": "unauth@company.com",
            "password": "password123",
            "role": "employee",
            "department": "Eng",
        },
        headers=auth_headers(manager_token),
    )
    assert response.status_code == 403
