"""
Unit tests for app.modules.employees.repositories — EmployeeRepository
"""

import pytest
from unittest.mock import AsyncMock, MagicMock

from app.modules.employees.repositories import EmployeeRepository


def _make_repo():
    """Create an EmployeeRepository with a mocked DB session."""
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    return EmployeeRepository(mock_db), mock_db


@pytest.mark.asyncio
async def test_get_by_id_found():
    """Should return the employee when found."""
    repo, db = _make_repo()
    emp = MagicMock(id=1, name="John")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = emp
    db.execute.return_value = mock_result

    result = await repo.get_by_id(1)
    assert result == emp


@pytest.mark.asyncio
async def test_get_by_id_not_found():
    """Should return None when not found."""
    repo, db = _make_repo()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    db.execute.return_value = mock_result

    result = await repo.get_by_id(99999)
    assert result is None


@pytest.mark.asyncio
async def test_get_by_email_found():
    """Should return employee by email."""
    repo, db = _make_repo()
    emp = MagicMock(id=1, email="john@co.com")
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = emp
    db.execute.return_value = mock_result

    result = await repo.get_by_email("john@co.com")
    assert result == emp


@pytest.mark.asyncio
async def test_list_employees_returns_list():
    """Should return a list of employees."""
    repo, db = _make_repo()
    emp1 = MagicMock(id=1)
    emp2 = MagicMock(id=2)
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [emp1, emp2]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    db.execute.return_value = mock_result

    result = await repo.list_employees()
    assert len(result) == 2


@pytest.mark.asyncio
async def test_create_adds_to_session():
    """create() should call db.add and db.flush."""
    repo, db = _make_repo()
    emp = MagicMock()

    await repo.create(emp)
    db.add.assert_called_once_with(emp)
    db.flush.assert_awaited_once()


@pytest.mark.asyncio
async def test_commit():
    """commit() should call db.commit."""
    repo, db = _make_repo()
    await repo.commit()
    db.commit.assert_awaited_once()
