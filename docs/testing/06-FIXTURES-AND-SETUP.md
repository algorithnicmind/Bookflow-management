# 🏗️ Fixtures & Test Setup — Infrastructure Guide

This document explains how to set up your **test database**, **shared fixtures**, **factory helpers**, and **configuration** so that all test files work correctly. **Read this first before writing any test.**

---

## 📌 Overview

| Component | Purpose | File |
|-----------|---------|------|
| **pytest.ini** | Pytest configuration (markers, asyncio mode) | `test/pytest.ini` |
| **conftest.py** | Root-level shared fixtures (app, client, DB) | `test/conftest.py` |
| **database.py** | Test database engine, session factory, cleanup | `test/fixtures/database.py` |
| **users.py** | Employee/User creation factories | `test/fixtures/users.py` |
| **leaves.py** | LeaveRequest, LeaveBalance creation factories | `test/fixtures/leaves.py` |
| **notifications.py** | Notification creation factory | `test/fixtures/notifications.py` |
| **settings.py** | SystemSetting creation factory | `test/fixtures/settings.py` |

---

## 1. `pytest.ini` — Configuration

```ini
# test/pytest.ini

[pytest]
asyncio_mode = auto
testpaths = test
python_files = test_*.py
python_functions = test_*
markers =
    unit: Unit tests (mocked dependencies)
    integration: Integration tests (real test DB)
    e2e: End-to-end workflow tests
    performance: Load and stress tests
    slow: Tests that take more than 5 seconds
```

---

## 2. `test/conftest.py` — Root Fixtures

This is the **most important file**. It provides the `client`, `db_session`, and token fixtures used by all tests.

```python
# test/conftest.py

import os
import sys
import pytest
import asyncio
from typing import AsyncGenerator

# Ensure the server directory is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'server'))

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.database import Base, get_db
from app.core.security import pwd_context, create_access_token
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveBalance, LeaveApproval
from app.modules.settings.models import SystemSetting
from app.modules.notifications.models import Notification
from main import app

from datetime import timedelta

# ─── Test Database ───────────────────────────────────────────────────
# Uses SQLite in-memory for speed. For Postgres-specific tests, use a
# separate test Postgres DB and set TEST_DATABASE_URL env var.

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "sqlite+aiosqlite:///./test.db"
)

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


# ─── Database Session Fixture ────────────────────────────────────────

@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Creates all tables before each test and drops them after.
    Each test gets a clean database.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ─── Override FastAPI's DB dependency ─────────────────────────────────

@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Provides an httpx AsyncClient that talks to the FastAPI app
    with the test database injected.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()


# ─── User Factory Fixtures ────────────────────────────────────────────

@pytest.fixture
async def create_user(db_session: AsyncSession):
    """
    Factory fixture for creating test users.
    Usage: user = await create_user(email="...", role="employee", ...)
    """
    async def _create(
        name: str = "Test User",
        email: str = "test@company.com",
        password: str = "password123",
        role: str = "employee",
        department: str = "Engineering",
        gender: str = "male",
        manager_id: int = None,
        is_active: bool = True,
    ) -> Employee:
        employee = Employee(
            name=name,
            email=email,
            password_hash=pwd_context.hash(password),
            role=role,
            department=department,
            gender=gender,
            manager_id=manager_id,
            is_active=is_active,
        )
        db_session.add(employee)
        await db_session.flush()

        # Create default leave balances
        from datetime import datetime
        current_year = datetime.now().year
        for leave_type, days in [
            ("casual", 12), ("sick", 12), ("earned", 18),
            ("maternity", 182), ("miscarriage", 42)
        ]:
            balance = LeaveBalance(
                employee_id=employee.id,
                leave_type=leave_type,
                total_days=days,
                year=current_year,
            )
            db_session.add(balance)

        await db_session.commit()
        return employee

    return _create


# ─── Pre-built User Fixtures ─────────────────────────────────────────

@pytest.fixture
async def super_admin(create_user):
    return await create_user(
        name="Super Admin",
        email="superadmin@company.com",
        role="super_admin",
        department=None
    )

@pytest.fixture
async def admin_user(create_user):
    return await create_user(
        name="Admin User",
        email="admin@company.com",
        role="admin",
        department=None
    )

@pytest.fixture
async def manager_user(create_user):
    return await create_user(
        name="Alice Manager",
        email="alice@company.com",
        role="manager",
        department="Engineering",
        gender="female"
    )

@pytest.fixture
async def employee_user(create_user, manager_user):
    return await create_user(
        name="John Doe",
        email="john@company.com",
        role="employee",
        department="Engineering",
        gender="male",
        manager_id=manager_user.id
    )


# ─── Token Generation Fixtures ───────────────────────────────────────

def make_token(user: Employee) -> str:
    """Generate a valid JWT token for a test user."""
    return create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=timedelta(hours=1)
    )

@pytest.fixture
def super_admin_token(super_admin) -> str:
    return make_token(super_admin)

@pytest.fixture
def admin_token(admin_user) -> str:
    return make_token(admin_user)

@pytest.fixture
def manager_token(manager_user) -> str:
    return make_token(manager_user)

@pytest.fixture
def employee_token(employee_user) -> str:
    return make_token(employee_user)

def auth_headers(token: str) -> dict:
    """Helper to create auth headers dict."""
    return {"Authorization": f"Bearer {token}"}


# ─── Seeded Database Fixture (for integration/e2e tests) ──────────────

@pytest.fixture
async def seeded_db(
    db_session, super_admin, admin_user, manager_user, employee_user
):
    """
    Provides a database pre-populated with all 4 role users.
    Returns a dict with all users for easy access.
    """
    return {
        "super_admin": super_admin,
        "admin": admin_user,
        "manager": manager_user,
        "employee": employee_user,
    }
```

---

## 3. `test/fixtures/database.py` — Database Utilities

```python
# test/fixtures/database.py

"""
Database utilities for test cleanup and state verification.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func


async def count_rows(db: AsyncSession, model) -> int:
    """Count total rows of a given model."""
    result = await db.execute(select(func.count()).select_from(model))
    return result.scalar()


async def get_all(db: AsyncSession, model) -> list:
    """Get all rows of a given model."""
    result = await db.execute(select(model))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, model, record_id: int):
    """Get a single record by ID."""
    result = await db.execute(select(model).where(model.id == record_id))
    return result.scalar_one_or_none()
```

---

## 4. `test/fixtures/users.py` — User Factories

```python
# test/fixtures/users.py

"""
Factory functions for creating test users with specific configurations.
Use these when you need more control than the conftest fixtures provide.
"""

from app.core.security import pwd_context
from app.modules.employees.models import Employee


def build_employee(
    name="Test User",
    email="test@company.com",
    password="password123",
    role="employee",
    department="Engineering",
    gender="male",
    manager_id=None,
    is_active=True,
) -> Employee:
    """
    Build an Employee object WITHOUT adding it to the DB.
    Useful for unit tests where you mock the DB.
    """
    return Employee(
        name=name,
        email=email,
        password_hash=pwd_context.hash(password),
        role=role,
        department=department,
        gender=gender,
        manager_id=manager_id,
        is_active=is_active,
    )


def build_deactivated_employee(**kwargs) -> Employee:
    """Build a deactivated employee."""
    return build_employee(is_active=False, **kwargs)
```

---

## 5. `test/fixtures/leaves.py` — Leave Factories

```python
# test/fixtures/leaves.py

"""
Factory functions for creating leave-related test data.
"""

from datetime import date, timedelta
from app.modules.leaves.models import LeaveRequest, LeaveBalance, LeaveApproval


def build_leave_request(
    employee_id: int,
    leave_type: str = "casual",
    start_date: date = None,
    end_date: date = None,
    reason: str = "Test leave",
    status: str = "pending",
) -> LeaveRequest:
    """Build a LeaveRequest object."""
    if start_date is None:
        start_date = date.today() + timedelta(days=1)
    if end_date is None:
        end_date = start_date + timedelta(days=2)

    return LeaveRequest(
        employee_id=employee_id,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        status=status,
    )


def build_leave_balance(
    employee_id: int,
    leave_type: str = "casual",
    total_days: int = 12,
    used_days: int = 0,
    year: int = None,
) -> LeaveBalance:
    """Build a LeaveBalance object."""
    from datetime import datetime
    if year is None:
        year = datetime.now().year

    return LeaveBalance(
        employee_id=employee_id,
        leave_type=leave_type,
        total_days=total_days,
        used_days=used_days,
        year=year,
    )


def build_leave_approval(
    leave_request_id: int,
    manager_id: int,
    action: str = "approved",
    comments: str = "Approved",
) -> LeaveApproval:
    """Build a LeaveApproval object."""
    return LeaveApproval(
        leave_request_id=leave_request_id,
        manager_id=manager_id,
        action=action,
        comments=comments,
    )
```

---

## 6. `test/fixtures/notifications.py` — Notification Factories

```python
# test/fixtures/notifications.py

"""
Factory functions for creating test notifications.
"""

from app.modules.notifications.models import Notification


def build_notification(
    user_id: int,
    title: str = "Test Notification",
    message: str = "This is a test notification",
    ntype: str = "info",
    is_read: bool = False,
    action_url: str = None,
) -> Notification:
    """Build a Notification object."""
    return Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=ntype,
        is_read=is_read,
        action_url=action_url,
    )
```

---

## 7. `test/fixtures/settings.py` — Settings Factories

```python
# test/fixtures/settings.py

"""
Factory functions for creating test system settings.
"""

from app.modules.settings.models import SystemSetting


def build_system_setting(
    max_casual_leave: int = 12,
    max_sick_leave: int = 12,
    max_earned_leave: int = 18,
    max_maternity_leave: int = 182,
    max_miscarriage_leave: int = 42,
) -> SystemSetting:
    """Build a SystemSetting object."""
    return SystemSetting(
        max_casual_leave=max_casual_leave,
        max_sick_leave=max_sick_leave,
        max_earned_leave=max_earned_leave,
        max_maternity_leave=max_maternity_leave,
        max_miscarriage_leave=max_miscarriage_leave,
    )
```

---

## 🚀 Running Tests

### Install Test Dependencies
```bash
cd server
pip install pytest pytest-asyncio httpx aiosqlite
```

### Run All Tests
```bash
# From the project root
pytest test/ -v

# Run only unit tests
pytest test/unit/ -v -m unit

# Run only integration tests
pytest test/integration/ -v -m integration

# Run only e2e tests
pytest test/e2e/ -v -m e2e

# Run a specific test file
pytest test/unit/leaves/test_leave_service.py -v

# Run a specific test function
pytest test/unit/leaves/test_leave_service.py::test_apply_leave_success -v
```

### Run with Coverage
```bash
pip install pytest-cov
pytest test/ --cov=app --cov-report=html --cov-report=term-missing

# Open the HTML report
# It will be at htmlcov/index.html
```

### Run with Verbose Output
```bash
pytest test/ -v -s  # -s shows print() output
```

---

## ⚠️ Important Notes

### SQLite vs PostgreSQL for Tests

| Aspect | SQLite (Default) | PostgreSQL |
|--------|:----------------:|:----------:|
| Speed | ⚡ Very fast | 🐢 Slower |
| Setup | None | Need test DB |
| Constraints | Some CHECK constraints differ | Full compatibility |
| Async | Via `aiosqlite` | Via `asyncpg` |
| Best for | Unit + integration tests | Final validation before deploy |

To use PostgreSQL for tests:
```bash
TEST_DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/leaveflow_test pytest test/ -v
```

### Test Isolation

Each test function gets a **clean database** — tables are created before and dropped after. This ensures:
- No test depends on another test's data
- Tests can run in any order
- Tests can run in parallel (with care)

### Fixture Dependency Chain

```
db_session → create_user → employee_user → employee_token
                         → manager_user  → manager_token
                         → admin_user    → admin_token
                         → super_admin   → super_admin_token
          → client (injects test DB into FastAPI)
          → seeded_db (pre-populates all 4 users)
```

---

## 📋 Checklist — Before You Start Writing Tests

- [ ] Created `test/` directory structure (see [00-TESTING-OVERVIEW.md](./00-TESTING-OVERVIEW.md))
- [ ] Created `test/conftest.py` with all fixtures
- [ ] Created `test/fixtures/` with factory helpers
- [ ] Created `test/pytest.ini` with configuration
- [ ] Installed `pytest`, `pytest-asyncio`, `httpx`, `aiosqlite`
- [ ] Verified `pytest test/ --co` lists all fixtures (no import errors)
- [ ] Wrote and ran one smoke test to confirm setup works

### Smoke Test
```python
# test/test_smoke.py

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_api_root(client: AsyncClient):
    """Verify the test client can reach the API."""
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Leave Management API is running"
```

Run it:
```bash
pytest test/test_smoke.py -v
```

If this passes, your test infrastructure is ready! 🎉

---

> **You're all set!** Go back to [00-TESTING-OVERVIEW.md](./00-TESTING-OVERVIEW.md) and start with [01-UNIT-TESTS.md](./01-UNIT-TESTS.md).
