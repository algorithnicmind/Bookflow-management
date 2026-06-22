"""
Core Authentication Dependencies
--------------------------------
This module provides FastAPI dependency injectables used to secure API routes.
It handles:
1. Extracting the JWT token from HttpOnly cookies or the Authorization header.
2. Validating the JWT token securely using the server's secret key.
3. Enforcing Role-Based Access Control (RBAC) to restrict endpoints to specific user roles.
"""

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import JWTError, jwt
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.database import get_db
from app.modules.employees.models import Employee
from app.core.config import settings

# This tells FastAPI where the login endpoint is for auto-generating Swagger UI docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

limiter = Limiter(key_func=get_remote_address)

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> Employee:
    """
    Dependency: Authenticates the user for the current request.
    
    Flow:
    1. Attempts to read the `access_token` from secure HttpOnly cookies (primary mechanism to prevent XSS).
    2. Falls back to reading the `Authorization: Bearer <token>` header if cookies aren't used (e.g. for API integrations).
    3. Decodes the JWT using the server's `JWT_SECRET`.
    4. Extracts the 'sub' (subject) claim, which stores the user's email.
    5. Looks up the active Employee record in the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Extract token from cookie (Secure approach)
    token = request.cookies.get("access_token")
    if not token:
        # 2. Fallback to standard Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise credentials_exception
        
    try:
        # 3. Decode JWT and verify signature
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # 4. Look up user by email
    result = await db.execute(select(Employee).where(Employee.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
        
    return user

class RoleChecker:
    """
    Dependency: Enforces Role-Based Access Control (RBAC).
    
    Usage:
    @router.get("/admin-only", dependencies=[Depends(RoleChecker(["admin", "super_admin"]))])
    """
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles
        
    def __call__(self, current_user: Employee = Depends(get_current_user)):
        # Verify that the authenticated user possesses one of the allowed roles
        if current_user.role not in self.allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Operation forbidden: Insufficient privileges")
        return current_user

async def RequireOwner(current_user: Employee = Depends(get_current_user)):
    """
    Dependency: Only allows access to the global Platform Owner (System department).
    This restricts tenant users (even super_admins of a tenant) from accessing platform-wide operations.
    """
    if current_user.department != 'System':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Operation forbidden: This endpoint is restricted to the platform owner."
        )
    return current_user

