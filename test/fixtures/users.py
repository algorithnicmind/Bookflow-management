"""
Factory functions for creating test Employee objects.
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
    id=None,
) -> Employee:
    """Build an Employee object WITHOUT adding it to the DB (for unit tests)."""
    emp = Employee(
        name=name,
        email=email,
        password_hash=pwd_context.hash(password),
        role=role,
        department=department,
        gender=gender,
        manager_id=manager_id,
        is_active=is_active,
    )
    if id is not None:
        emp.id = id
    return emp


def build_deactivated_employee(**kwargs) -> Employee:
    """Build a deactivated employee."""
    kwargs["is_active"] = False
    return build_employee(**kwargs)
