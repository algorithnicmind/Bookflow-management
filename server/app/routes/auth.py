from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.database import get_db
from app.models import Employee, LeaveBalance
from app.schemas import Token, AdminCreateRequest
from app.config import settings
from app.dependencies import get_current_user, RoleChecker
from app.utils import pwd_context



router = APIRouter(prefix="/api/auth", tags=["auth"])


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


@router.post("/login", response_model=Token)
async def login(request: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.email == request.username))
    user = result.scalar_one_or_none()
    
    if not user or not pwd_context.verify(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department
        }
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: AdminCreateRequest, db: AsyncSession = Depends(get_db), current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))):
    result = await db.execute(select(Employee).where(Employee.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        
    hashed_password = pwd_context.hash(request.password)
    new_employee = Employee(
        name=request.name,
        email=request.email,
        password_hash=hashed_password,
        role="admin", # Simplified for /register per API docs
        department="Management"
    )
    
    db.add(new_employee)
    await db.flush() # flush to get new_employee.id
    
    current_year = datetime.now(timezone.utc).year
    for leave_type, days in [("casual", 12), ("sick", 10), ("earned", 15)]:
        balance = LeaveBalance(employee_id=new_employee.id, leave_type=leave_type, total_days=days, year=current_year)
        db.add(balance)
        
    await db.commit()
    
    return {
        "message": "Admin registered successfully",
        "employee": {
            "id": new_employee.id,
            "name": new_employee.name,
            "email": new_employee.email,
            "role": new_employee.role,
            "department": new_employee.department
        }
    }
