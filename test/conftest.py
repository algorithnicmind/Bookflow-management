"""
Root conftest.py — Shared fixtures for the entire test suite.

Provides:
- Test database engine and session (SQLite in-memory)
- FastAPI test client with DB override
- Pre-built user fixtures (super_admin, admin, manager, employee)
- JWT token generation helpers
"""

import os
import sys
import pytest
from typing import AsyncGenerator
from datetime import datetime, timedelta

# Ensure the server directory is on the Python path
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


# ─── Test Database (SQLite in-memory) ─────────────────────────────────

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "sqlite+aiosqlite:///:memory:"
)

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ─── Database Session Fixture ────────────────────────────────────────

@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create all tables before each test and drop them after.
    Each test gets a completely clean database.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ─── FastAPI Test Client ──────────────────────────────────────────────

@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Provides an httpx AsyncClient talking to the FastAPI app
    with the test database injected.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()


# ─── User Factory ─────────────────────────────────────────────────────

@pytest.fixture
def create_user(db_session: AsyncSession):
    """
    Factory fixture for creating test users with leave balances.

    Usage:
        user = await create_user(email="test@co.com", role="employee")
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

        # Create default leave balances for the current year
        current_year = datetime.now().year
        for leave_type, days in [
            ("casual", 12), ("sick", 12), ("earned", 18),
            ("maternity", 182), ("miscarriage", 42),
        ]:
            balance = LeaveBalance(
                employee_id=employee.id,
                leave_type=leave_type,
                total_days=days,
                used_days=0,
                year=current_year,
            )
            db_session.add(balance)

        await db_session.commit()
        await db_session.refresh(employee)
        return employee

    return _create


# ─── Pre-built User Fixtures ─────────────────────────────────────────

@pytest.fixture
async def super_admin(create_user):
    return await create_user(
        name="Super Admin",
        email="superadmin@company.com",
        role="super_admin",
        department=None,
    )


@pytest.fixture
async def admin_user(create_user):
    return await create_user(
        name="Admin User",
        email="admin@company.com",
        role="admin",
        department=None,
    )


@pytest.fixture
async def manager_user(create_user):
    return await create_user(
        name="Alice Manager",
        email="alice@company.com",
        role="manager",
        department="Engineering",
        gender="female",
    )


@pytest.fixture
async def employee_user(create_user, manager_user):
    return await create_user(
        name="John Doe",
        email="john@company.com",
        role="employee",
        department="Engineering",
        gender="male",
        manager_id=manager_user.id,
    )


# ─── Token Helpers ────────────────────────────────────────────────────

def make_token(user: Employee) -> str:
    """Generate a valid JWT token for a test user."""
    return create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=timedelta(hours=1),
    )


def auth_headers(token: str) -> dict:
    """Build Authorization header dict from a token string."""
    return {"Authorization": f"Bearer {token}"}


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


# ─── Seeded Database ─────────────────────────────────────────────────

@pytest.fixture
async def seeded_db(db_session, super_admin, admin_user, manager_user, employee_user):
    """
    Provides a database pre-populated with all 4 role users.
    Returns a dict for easy access in tests.
    """
    return {
        "super_admin": super_admin,
        "admin": admin_user,
        "manager": manager_user,
        "employee": employee_user,
    }
