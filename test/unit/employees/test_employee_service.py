"""
Unit tests for app.modules.employees.services — EmployeeService
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException

from app.modules.employees.services import EmployeeService
from app.modules.employees.schemas import EmployeeCreate, EmployeeUpdate


from unittest.mock import AsyncMock, MagicMock, patch

def _make_service(repo_mock=None):
    """Create an EmployeeService with a mocked repository."""
    if repo_mock is None:
        repo_mock = AsyncMock()
        repo_mock.organization_id = 1
        repo_mock.db = AsyncMock()
        repo_mock.db.add = MagicMock()
    return EmployeeService(repo_mock), repo_mock
    
# We must mock AuditLogService.log_action for all tests in this module
# to prevent "coroutine was never awaited" warnings.
pytestmark = pytest.mark.filterwarnings("ignore::RuntimeWarning")
patcher = patch("app.modules.employees.services.AuditLogService.log_action", new_callable=AsyncMock)
patcher.start()


# ─── list_employees ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_list_employees_returns_all():
    """Should return a list of employee dicts."""
    service, repo = _make_service()
    emp1 = MagicMock(id=1, email="john@co.com", role="employee",
                     department="Eng", manager_id=None, is_active=True,
                     created_at="2026-01-01", gender="male")
    emp1.name = "John"
    emp2 = MagicMock(id=2, email="jane@co.com", role="employee",
                     department="Design", manager_id=None, is_active=True,
                     created_at="2026-01-02", gender="female")
    emp2.name = "Jane"
    repo.list_employees.return_value = [emp1, emp2]

    result = await service.list_employees()
    assert len(result) == 2
    assert result[0]["name"] == "John"
    assert result[1]["name"] == "Jane"


@pytest.mark.asyncio
async def test_list_employees_with_manager_name():
    """Should resolve manager_name when manager_id is set."""
    service, repo = _make_service()
    manager = MagicMock(id=1)
    manager.name = "Alice Manager"
    emp = MagicMock(id=2, email="john@co.com", role="employee",
                    department="Eng", manager_id=1, is_active=True,
                    created_at="2026-01-01", gender="male")
    emp.name = "John"
    repo.list_employees.return_value = [emp]
    repo.get_by_id.return_value = manager

    result = await service.list_employees()
    assert result[0]["manager_name"] == "Alice Manager"


@pytest.mark.asyncio
async def test_list_employees_search():
    """Search parameter should be forwarded to repo."""
    service, repo = _make_service()
    repo.list_employees.return_value = []

    await service.list_employees(search="john")
    repo.list_employees.assert_awaited_once_with("john")


# ─── create_employee ─────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_create_employee_success():
    """Valid data creates an employee with hashed password."""
    service, repo = _make_service()
    repo.get_by_email.return_value = None

    data = EmployeeCreate(
        name="New Guy", email="new@co.com", password="pass123",
        role="employee", department="Eng", gender="male",
    )

    result = await service.create_employee(data)
    repo.create.assert_awaited_once()
    repo.commit.assert_awaited_once()
    assert result.name == "New Guy"


@pytest.mark.asyncio
async def test_create_employee_duplicate_email():
    """Duplicate email raises 409."""
    service, repo = _make_service()
    repo.get_by_email.return_value = MagicMock()  # Existing employee

    data = EmployeeCreate(
        name="Dup", email="existing@co.com", password="pass123",
        role="employee", department="Eng",
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.create_employee(data)
    assert exc_info.value.status_code == 409


@pytest.mark.asyncio
async def test_create_employee_hashes_password():
    """Password should be hashed, not stored in plain text."""
    service, repo = _make_service()
    repo.get_by_email.return_value = None

    created_employee = None

    async def capture_create(emp):
        nonlocal created_employee
        created_employee = emp
        return emp

    repo.create = capture_create

    data = EmployeeCreate(
        name="Hash Test", email="hash@co.com", password="mypassword",
        role="employee", department="Eng",
    )

    await service.create_employee(data)
    assert created_employee is not None
    assert created_employee.password_hash != "mypassword"
    assert created_employee.password_hash.startswith("$2b$") or \
           created_employee.password_hash.startswith("$2a$")


# ─── update_employee ─────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_update_employee_success():
    """Partial update should only change specified fields."""
    service, repo = _make_service()
    emp = MagicMock(id=1, name="Old Name", role="employee", department="Eng",
                    manager_id=None, gender="male")
    repo.get_by_id.return_value = emp

    data = EmployeeUpdate(name="New Name")
    await service.update_employee(1, data)
    assert emp.name == "New Name"
    repo.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_update_employee_not_found():
    """Non-existent employee raises 404."""
    service, repo = _make_service()
    repo.get_by_id.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        await service.update_employee(99999, EmployeeUpdate(name="x"))
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_update_employee_partial_fields():
    """Only specified fields change; others remain untouched."""
    service, repo = _make_service()
    emp = MagicMock(id=1, role="employee", department="Eng",
                    manager_id=None, gender="male")
    emp.configure_mock(name="Old")
    repo.get_by_id.return_value = emp

    data = EmployeeUpdate(department="Design")
    await service.update_employee(1, data)
    assert emp.department == "Design"
    # name should NOT have been reassigned
    assert emp.name == "Old"


# ─── deactivate_employee ─────────────────────────────────────────────


@pytest.mark.asyncio
async def test_deactivate_employee_success():
    """Should set is_active to False."""
    service, repo = _make_service()
    emp = MagicMock(id=2, is_active=True)
    repo.get_by_id.return_value = emp

    await service.deactivate_employee(2, current_user_id=1)
    assert emp.is_active is False
    repo.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_deactivate_employee_self():
    """Cannot deactivate your own account."""
    service, repo = _make_service()

    with pytest.raises(HTTPException) as exc_info:
        await service.deactivate_employee(1, current_user_id=1)
    assert exc_info.value.status_code == 400
    assert "own account" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_deactivate_employee_not_found():
    """Non-existent employee raises 404."""
    service, repo = _make_service()
    repo.get_by_id.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        await service.deactivate_employee(99999, current_user_id=1)
    assert exc_info.value.status_code == 404
