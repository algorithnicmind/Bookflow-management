"""
Unit tests for app.modules.auth.services — authenticate_user, register_admin_user
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException

from app.modules.auth.services import AuthService
from app.modules.auth.schemas import AdminCreateRequest
from app.modules.auth.repositories import AuthRepository


# ─── authenticate_user ────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_authenticate_user_success():
    """Valid email + correct password returns the Employee."""
    mock_db = AsyncMock()
    mock_employee = MagicMock(
        email="john@company.com",
        password_hash="$2b$12$hashed",
        is_active=True,
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_employee
    mock_db.execute.return_value = mock_result

    repo = AuthRepository(mock_db)
    service = AuthService(repo)

    with patch("app.modules.auth.services.pwd_context") as mock_pwd:
        mock_pwd.verify.return_value = True
        user = await service.authenticate_user("john@company.com", "password123")

    assert user == mock_employee


@pytest.mark.asyncio
async def test_authenticate_user_wrong_password():
    """Wrong password raises 401."""
    mock_db = AsyncMock()
    mock_employee = MagicMock(
        email="john@company.com",
        password_hash="$2b$12$hashed",
        is_active=True,
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_employee
    mock_db.execute.return_value = mock_result

    repo = AuthRepository(mock_db)
    service = AuthService(repo)

    with patch("app.modules.auth.services.pwd_context") as mock_pwd:
        mock_pwd.verify.return_value = False
        with pytest.raises(HTTPException) as exc_info:
            await service.authenticate_user("john@company.com", "wrongpass")
        assert exc_info.value.status_code == 401
        assert "Invalid email or password" in exc_info.value.detail


@pytest.mark.asyncio
async def test_authenticate_user_nonexistent_email():
    """Non-existent email raises 401."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    repo = AuthRepository(mock_db)
    service = AuthService(repo)

    with pytest.raises(HTTPException) as exc_info:
        await service.authenticate_user("ghost@company.com", "any")
    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_authenticate_user_deactivated_account():
    """Deactivated account raises 403."""
    mock_db = AsyncMock()
    mock_employee = MagicMock(
        email="john@company.com",
        password_hash="$2b$12$hashed",
        is_active=False,
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_employee
    mock_db.execute.return_value = mock_result

    repo = AuthRepository(mock_db)
    service = AuthService(repo)

    with patch("app.modules.auth.services.pwd_context") as mock_pwd:
        mock_pwd.verify.return_value = True
        with pytest.raises(HTTPException) as exc_info:
            await service.authenticate_user("john@company.com", "password123")
        assert exc_info.value.status_code == 403
        assert "deactivated" in exc_info.value.detail.lower()


# ─── register_admin_user ──────────────────────────────────────────────


@pytest.mark.asyncio
async def test_register_admin_user_success():
    """Valid registration creates an admin + 5 leave balances."""
    mock_db = AsyncMock()
    # No existing user
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    add_calls = []
    mock_db.add = lambda obj: add_calls.append(obj)

    request = AdminCreateRequest(
        name="New Admin",
        email="newadmin@company.com",
        password="password123",
        gender="male",
    )

    repo = AuthRepository(mock_db)
    service = AuthService(repo)

    with patch("app.modules.auth.services.pwd_context") as mock_pwd:
        mock_pwd.hash.return_value = "$2b$12$hashed"
        result = await service.register_admin_user(request, 1)

    assert result.role == "admin"
    assert result.email == "newadmin@company.com"
    # 1 employee + 5 leave balances = 6 objects added
    assert len(add_calls) == 6


@pytest.mark.asyncio
async def test_register_admin_user_duplicate_email():
    """Duplicate email raises 409."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = MagicMock()  # Existing user
    mock_db.execute.return_value = mock_result

    repo = AuthRepository(mock_db)
    service = AuthService(repo)

    request = AdminCreateRequest(
        name="Dup Admin",
        email="existing@company.com",
        password="password123",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.register_admin_user(request, 1)
    assert exc_info.value.status_code == 409
    assert "already registered" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_register_admin_creates_correct_leave_balances():
    """Registration creates balances for casual(12), sick(12), earned(18), maternity(182), miscarriage(42)."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    added_objects = []
    mock_db.add = lambda obj: added_objects.append(obj)

    repo = AuthRepository(mock_db)
    service = AuthService(repo)

    request = AdminCreateRequest(
        name="New Admin",
        email="admin2@company.com",
        password="password123",
    )

    with patch("app.modules.auth.services.pwd_context") as mock_pwd:
        mock_pwd.hash.return_value = "$2b$12$hashed"
        await service.register_admin_user(request, 1)

    # Filter only LeaveBalance objects
    from app.modules.leaves.models import LeaveBalance
    balances = [obj for obj in added_objects if isinstance(obj, LeaveBalance)]

    assert len(balances) == 5
    balance_map = {b.leave_type: b.total_days for b in balances}
    assert balance_map["casual"] == 12
    assert balance_map["sick"] == 12
    assert balance_map["earned"] == 18
    assert balance_map["maternity"] == 182
    assert balance_map["miscarriage"] == 42
