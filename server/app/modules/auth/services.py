from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.security import pwd_context, create_access_token
from app.core.config import settings
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance
from app.modules.auth.schemas import AdminCreateRequest

async def authenticate_user(username: str, password_plain: str, db: AsyncSession) -> Employee:
    result = await db.execute(select(Employee).where(Employee.email == username))
    user = result.scalar_one_or_none()
    
    if not user or not pwd_context.verify(password_plain, user.password_hash):
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

async def register_admin_user(request: AdminCreateRequest, db: AsyncSession) -> Employee:
    result = await db.execute(select(Employee).where(Employee.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        
    hashed_password = pwd_context.hash(request.password)
    new_employee = Employee(
        name=request.name,
        email=request.email,
        password_hash=hashed_password,
        role="admin",  # Simplified for /register per API docs
        department="Management"
    )
    
    db.add(new_employee)
    await db.flush()  # flush to get new_employee.id
    
    current_year = datetime.now().year
    for leave_type, days in [("casual", 12), ("sick", 10), ("earned", 15)]:
        balance = LeaveBalance(employee_id=new_employee.id, leave_type=leave_type, total_days=days, year=current_year)
        db.add(balance)
        
    await db.commit()
    return new_employee
