"""
Authentication Services
-----------------------
This module handles the core business logic for user authentication.
It ensures that passwords are verified securely, accounts are active,
and new administrators are properly provisioned with default Leave Balances.
"""

from datetime import datetime
import asyncio
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.security import pwd_context
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance
from app.modules.auth.schemas import AdminCreateRequest

async def authenticate_user(username: str, password_plain: str, db: AsyncSession) -> Employee:
    """
    Core Login Flow:
    1. Looks up the user by email.
    2. Runs bcrypt password verification in a background thread to prevent blocking the async event loop.
    3. Checks if the account is active.
    
    Returns the Employee object if successful, raises HTTPException (401/403) otherwise.
    """
    from app.modules.employees.models import PlatformOwner
    result = await db.execute(select(Employee).where(Employee.email == username))
    user = result.scalar_one_or_none()
    if not user:
        po_res = await db.execute(select(PlatformOwner).where(PlatformOwner.email == username))
        user = po_res.scalar_one_or_none()
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # Security Note: pwd_context.verify is synchronous and CPU intensive.
    # We MUST run it in asyncio.to_thread to prevent blocking the entire FastAPI server.
    is_valid = await asyncio.to_thread(pwd_context.verify, password_plain, user.password_hash)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
        
    return user

async def register_admin_user(request: AdminCreateRequest, org_id: int, db: AsyncSession) -> Employee:
    """
    Tenant Administrator Registration:
    This function registers the very first user (the Admin) for a newly approved tenant organization.
    
    Architectural constraints handled here:
    1. Prevents duplicate emails.
    2. Hashes the password securely.
    3. Flushes the new Employee to the DB to generate their sequential ID.
    4. Automatically provisions their default Leave Balances for the current year.
    """
    result = await db.execute(select(Employee).where(Employee.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        
    # Hash password in a background thread
    hashed_password = await asyncio.to_thread(pwd_context.hash, request.password)
    
    new_employee = Employee(
        organization_id=org_id,
        name=request.name,
        email=request.email,
        password_hash=hashed_password,
        role="admin",  # Simplified for /register per API docs
        department=None,
        gender=request.gender
    )
    
    db.add(new_employee)
    await db.flush()  # flush to get new_employee.id without committing
    
    # Provision initial leave balances for the newly created admin
    current_year = datetime.now().year
    for leave_type, days in [("casual", 12), ("sick", 12), ("earned", 18), ("maternity", 182), ("miscarriage", 42)]:
        balance = LeaveBalance(
            organization_id=org_id, 
            employee_id=new_employee.id, 
            leave_type=leave_type, 
            total_days=days, 
            year=current_year
        )
        db.add(balance)
        
    await db.commit()
    return new_employee
