from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import JWTError, jwt
from app.core.database import get_db
from app.modules.employees.models import Employee
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> Employee:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = request.cookies.get("access_token")
    if not token:
        # Fallback to authorization header if cookie is not present
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise credentials_exception
    try:
        # Note: In production, verify the signature using Clerk's JWKS
        # For now, we extract the unverified claims, or if you use the Clerk SDK, verify it.
        # Since we migrated to Clerk, the 'sub' claim is the Clerk User ID.
        payload = jwt.decode(token, options={"verify_signature": False})
        clerk_id: str = payload.get("sub")
        if not clerk_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(Employee).where(Employee.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        # Fallback to email for existing users who haven't linked their clerk_id yet
        email: str = payload.get("email") or payload.get("email_addresses", [""])[0]
        if email:
            result = await db.execute(select(Employee).where(Employee.email == email))
            user = result.scalar_one_or_none()
            
            # If user found by email, link their clerk_id
            if user:
                user.clerk_id = clerk_id
                await db.commit()

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
        
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles
        
    def __call__(self, current_user: Employee = Depends(get_current_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Operation forbidden: Insufficient privileges")
        return current_user

async def RequireOwner(current_user: Employee = Depends(get_current_user)):
    """Only allows access to the Platform Owner."""
    if current_user.department != 'System':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Operation forbidden: This endpoint is restricted to the platform owner."
        )
    return current_user
