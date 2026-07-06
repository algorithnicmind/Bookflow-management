"""
Integration tests for POST /api/auth/login
"""

import pytest
from httpx import AsyncClient
from conftest import auth_headers


@pytest.mark.asyncio
async def test_login_success_employee(client: AsyncClient, employee_user, seeded_db):
    """Valid employee credentials should return 200 with token."""
    response = await client.post(
        "/api/auth/login",
        data={"username": "john@company.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in response.cookies
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "employee"
    assert data["user"]["email"] == "john@company.com"


@pytest.mark.asyncio
async def test_login_success_manager(client: AsyncClient, seeded_db):
    """Valid manager credentials should return 200."""
    response = await client.post(
        "/api/auth/login",
        data={"username": "alice@company.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "manager"


@pytest.mark.asyncio
async def test_login_success_admin(client: AsyncClient, seeded_db):
    """Valid admin credentials should return 200."""
    response = await client.post(
        "/api/auth/login",
        data={"username": "admin@company.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "admin"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, seeded_db):
    """Wrong password should return 401."""
    response = await client.post(
        "/api/auth/login",
        data={"username": "john@company.com", "password": "wrongpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_nonexistent_email(client: AsyncClient, seeded_db):
    """Non-existent email should return 401."""
    response = await client.post(
        "/api/auth/login",
        data={"username": "ghost@company.com", "password": "anything"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_deactivated_user(client: AsyncClient, create_user):
    """Deactivated user should be rejected."""
    await create_user(
        name="Inactive User",
        email="inactive@company.com",
        password="password123",
        is_active=False,
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "inactive@company.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 403
    assert "deactivated" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_returns_user_object(client: AsyncClient, seeded_db):
    """Login response should include user details."""
    response = await client.post(
        "/api/auth/login",
        data={"username": "john@company.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    user = response.json()["user"]
    assert "id" in user
    assert "name" in user
    assert "email" in user
    assert "role" in user


@pytest.mark.asyncio
async def test_login_token_is_valid_jwt(client: AsyncClient, seeded_db):
    """Token should be decodable as a valid JWT."""
    from jose import jwt
    from app.core.config import settings

    response = await client.post(
        "/api/auth/login",
        data={"username": "john@company.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    token = response.cookies.get("access_token")
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert payload["sub"] == "john@company.com"
    assert payload["role"] == "employee"
