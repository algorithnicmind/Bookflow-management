"""
Integration tests for POST /api/auth/register
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers, make_token


@pytest.mark.asyncio
async def test_register_admin_success(client: AsyncClient, super_admin, super_admin_token):
    """Super admin should be able to register a new admin."""
    response = await client.post(
        "/api/auth/register",
        json={
            "name": "New Admin",
            "email": "newadmin@company.com",
            "password": "password123",
            "gender": "male",
        },
        headers=auth_headers(super_admin_token),
    )
    assert response.status_code == 201
    assert "registered" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, super_admin, super_admin_token, seeded_db):
    """Duplicate email should return 409."""
    response = await client.post(
        "/api/auth/register",
        json={
            "name": "Dup Admin",
            "email": "admin@company.com",  # Already exists
            "password": "password123",
        },
        headers=auth_headers(super_admin_token),
    )
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_as_admin_forbidden(client: AsyncClient, admin_user, admin_token):
    """Regular admin should not be able to register new admins."""
    response = await client.post(
        "/api/auth/register",
        json={
            "name": "Unauthorized",
            "email": "unauth@company.com",
            "password": "password123",
        },
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_register_as_employee_forbidden(client: AsyncClient, employee_user, employee_token):
    """Employee should not be able to register admins."""
    response = await client.post(
        "/api/auth/register",
        json={
            "name": "Unauthorized",
            "email": "unauth@company.com",
            "password": "password123",
        },
        headers=auth_headers(employee_token),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_register_no_token(client: AsyncClient, db_session):
    """No token should return 401."""
    response = await client.post(
        "/api/auth/register",
        json={
            "name": "No Auth",
            "email": "noauth@company.com",
            "password": "password123",
        },
    )
    assert response.status_code == 401
