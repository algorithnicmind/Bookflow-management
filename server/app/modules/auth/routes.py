from datetime import timedelta
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.core.dependencies import RoleChecker
from app.modules.employees.models import Employee
from app.modules.auth.schemas import Token, AdminCreateRequest
from app.modules.auth.services import authenticate_user, register_admin_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=Token)
async def login(request: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(request.username, request.password, db)
    
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
async def register(
    request: AdminCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    new_employee = await register_admin_user(request, db)
    
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
