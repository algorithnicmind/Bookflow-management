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
from app.modules.employees.models import Employee, PlatformOwner
from app.core.config import settings

# This tells FastAPI where the login endpoint is for auto-generating Swagger UI docs
# It also provides a fallback mechanism for retrieving the token if cookies aren't used.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Initialize the rate limiter, utilizing the client's IP address to track request counts.
# This prevents brute-force login attempts and mitigates DDoS risks.
limiter = Limiter(key_func=get_remote_address)

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> Employee | PlatformOwner:
    """
    Dependency: Authenticates the user for the current request.
    
    Flow:
    1. Attempts to read the `access_token` from secure HttpOnly cookies (primary mechanism to prevent XSS).
    2. Falls back to reading the `Authorization: Bearer <token>` header if cookies aren't used (e.g. for API integrations).
    3. Decodes the JWT using the server's `JWT_SECRET`.
    4. Extracts the 'sub' (subject) claim, which stores the user's email.
    5. Looks up the active Employee or PlatformOwner record in the database.
    """
    # Standard exception to raise if any step of the validation fails
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
            
    # If no token is provided through either channel, reject the request
    if not token:
        raise credentials_exception
        
    try:
        # 3. Decode JWT and verify cryptographic signature
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        
        # 4. Extract the user's email from the subject claim
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        # If the token is expired or the signature is invalid, reject the request
        raise credentials_exception
        
    # 5. Look up user by email in the Employee table
    result = await db.execute(select(Employee).where(Employee.email == email))
    user = result.scalar_one_or_none()

    # If the user isn't a standard employee, check if they are a PlatformOwner
    if user is None:
        from app.modules.employees.models import PlatformOwner
        po_res = await db.execute(select(PlatformOwner).where(PlatformOwner.email == email))
        user = po_res.scalar_one_or_none()

    # If neither an employee nor platform owner was found, reject the request
    if user is None:
        raise credentials_exception
        
    # Ensure the user account has not been deactivated
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
        
    # Return the validated database user model
    return user

class PermissionChecker:
    """
    Dependency: Enforces dynamic Permission-Based Access Control.
    Checks against RolePermission table in DB based on dynamic role name.
    """
    def __init__(self, required_permission: str):
        # The specific action permission this endpoint requires (e.g., 'manage_employees')
        self.required_permission = required_permission
        
    async def __call__(self, request: Request, current_user: Employee | PlatformOwner = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
        # Import dynamically to avoid circular dependencies
        from app.modules.employees.models import PlatformOwner
        
        # Platform Owners bypass standard tenant-level permission checks and receive global admin rights
        if isinstance(current_user, PlatformOwner):
            current_user.permissions = ["manage_everything"] 
            return current_user
            
        from app.modules.organizations.models import RolePermission
        
        # Look up the permissions assigned to the current user's role within their specific tenant
        res = await db.execute(select(RolePermission).where(
            (RolePermission.organization_id == current_user.organization_id) &
            (RolePermission.role_name == current_user.role)
        ))
        role_perm = res.scalar_one_or_none()
        
        # If the role is undocumented in the database, fall back to sensible defaults
        # based on the role name so that new organizations work out of the box.
        if not role_perm:
            default_permissions = {
                "super_admin": ["manage_everything", "manage_employees", "approve_leaves", "view_reports"],
                "admin": ["manage_employees", "approve_leaves", "view_reports"],
                "manager": ["approve_leaves", "view_reports"],
            }
            user_perms = set(default_permissions.get(current_user.role, []))
            if self.required_permission not in user_perms:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Operation forbidden: Missing '{self.required_permission}' permission")
            current_user.permissions = list(user_perms)
            return current_user
            
        # Convert permissions list to a set for fast O(1) lookup
        user_perms = set(role_perm.permissions)
        
        # Check if the user possesses the specific permission required by the endpoint
        if self.required_permission not in user_perms:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Operation forbidden: Missing '{self.required_permission}' permission")
            
        # Attach the resolved permissions to the user object so inline route logic can access them
        current_user.permissions = list(user_perms)
        return current_user

async def RequireOwner(current_user: Employee | PlatformOwner = Depends(get_current_user)):
    """
    Dependency: Only allows access to the global Platform Owner (System department).
    This restricts tenant users (even super_admins of a tenant) from accessing platform-wide operations
    such as onboarding new organizations or reviewing global leads.
    """
    # Ensure the user belongs to the 'System' department (indicating PlatformOwner)
    if current_user.department != 'System':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Operation forbidden: This endpoint is restricted to the platform owner."
        )
    return current_user
