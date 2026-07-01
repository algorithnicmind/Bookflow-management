from fastapi import APIRouter, Depends, status, HTTPException, Response, Request, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
import os
import httpx
import urllib.parse
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.core.dependencies import PermissionChecker, RequireOwner, limiter, get_current_user
from app.modules.employees.models import Employee, PlatformOwner
from app.modules.auth.schemas import Token, AdminCreateRequest
from app.modules.auth.services import AuthService
from app.modules.auth.repositories import AuthRepository
from pydantic import BaseModel, EmailStr
from app.core.tenant import get_current_tenant
from app.modules.organizations.models import Organization

"""
Authentication Router
---------------------
Handles user login, session validation, OAuth flows, and platform impersonation.
"""

router = APIRouter(prefix="/api/auth", tags=["auth"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """Dependency injection to provide the AuthService instance to routes."""
    repo = AuthRepository(db)
    return AuthService(repo)

@router.get("/session")
async def check_session(request: Request, service: AuthService = Depends(get_auth_service)):
    """
    Validates if the user's current session cookie is still active and valid.
    Called by the frontend on initial load to restore the user state.
    """
    token = request.cookies.get("access_token")
    if not token:
        return {"user": None}
    return await service.check_session(token)

class OAuthRequest(BaseModel):
    email: EmailStr
    provider: str

@router.post("/oauth-login")
async def oauth_login(request: OAuthRequest, response: Response, service: AuthService = Depends(get_auth_service)):
    """
    Handles logging a user in via an external OAuth provider (e.g., Google).
    If the email exists in the system, it generates a session and returns a JWT.
    """
    result = await service.oauth_login(request.email)
    
    # Set the JWT securely as an HttpOnly cookie to prevent XSS attacks
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    user = result["user"]
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": getattr(user, 'department', None),
            "profile_image_url": getattr(user, "profile_image_url", None)
        }
    }

@router.post("/login", response_model=Token)
@limiter.limit("5/minute") # Rate limit login attempts to prevent brute-force attacks
async def login_for_access_token(
    request: Request,
    response: Response, 
    form_data: OAuth2PasswordRequestForm = Depends(), 
    service: AuthService = Depends(get_auth_service)
):
    """
    Standard email/password login endpoint.
    Verifies credentials and issues a JWT if successful.
    """
    # Authenticate credentials against the database
    user = await service.authenticate_user(form_data.username, form_data.password)
    
    from app.core.security import create_access_token
    from datetime import timedelta
    
    # Generate the signed JWT token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    # Store token in a secure HttpOnly cookie for browser clients
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": getattr(user, "department", None),
            "profile_image_url": getattr(user, "profile_image_url", None)
        }
    }

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("NEXT_PUBLIC_FRONTEND_URL", "http://localhost:3000")

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    service: AuthService = Depends(get_auth_service),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    """
    Allows the authenticated user to upload a profile picture/avatar.
    Saves the file data directly into the database.
    """
    file_data = await file.read()
    url = await service.upload_avatar(current_user, file.filename, file.content_type, file_data, BACKEND_URL)
    return {"profile_image_url": url}

@router.get("/google/login")
async def google_login():
    """
    Initiates the Google OAuth2 login flow by redirecting the user to Google's consent screen.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID is not configured.")
    redirect_uri = f"{BACKEND_URL}/api/auth/google/callback"
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        "response_type=code&"
        "scope=openid email profile"
    )
    return RedirectResponse(url=auth_url)

@router.get("/google/callback")
async def google_callback(code: str):
    """
    Callback handler for Google OAuth. 
    Exchanges the authorization code for an access token and retrieves the user's email.
    """
    redirect_uri = f"{BACKEND_URL}/api/auth/google/callback"
    token_url = "https://oauth2.googleapis.com/token"
    async with httpx.AsyncClient() as client:
        # Request access token from Google
        resp = await client.post(token_url, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"OAuth error: {resp.text}")
        
        # Retrieve user email using the access token
        access_token = resp.json().get("access_token")
        user_resp = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={"Authorization": f"Bearer {access_token}"})
        email = user_resp.json().get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

    # Redirect the user back to the frontend to finalize the session via /oauth-login
    frontend_redirect_url = f"{FRONTEND_URL}/onboarding/oauth-callback?email={urllib.parse.quote(email)}&provider=google"
    return RedirectResponse(url=frontend_redirect_url)

@router.post("/logout")
async def logout(response: Response):
    """
    Logs the user out by deleting their session cookie.
    """
    response.delete_cookie(key="access_token", httponly=True, secure=settings.ENVIRONMENT != "development", samesite="lax")
    return {"message": "Logged out successfully"}

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_admin(
    request: AdminCreateRequest,
    service: AuthService = Depends(get_auth_service),
    current_user: Employee = Depends(PermissionChecker("manage_settings")),
    current_org: Organization = Depends(get_current_tenant)
):
    """
    Allows a tenant admin to manually register another admin user within their organization.
    Requires 'manage_settings' permission.
    """
    new_employee = await service.register_admin_user(request, current_org.id)
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

@router.post("/impersonate/{org_id}", response_model=Token)
async def impersonate_tenant(
    org_id: int,
    response: Response,
    service: AuthService = Depends(get_auth_service),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    """
    [Platform Owner Only] Impersonates a target organization (tenant) by logging in
    as the primary super admin of that organization.
    """
    result = await service.impersonate_tenant(org_id)
    
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    target_admin = result["user"]
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": {
            "id": target_admin.id,
            "email": target_admin.email,
            "name": target_admin.name,
            "role": target_admin.role,
            "department": target_admin.department,
            "organization_id": target_admin.organization_id
        }
    }

@router.post("/impersonate/employee/{employee_id}", response_model=Token)
async def impersonate_employee(
    employee_id: int,
    response: Response,
    service: AuthService = Depends(get_auth_service),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    """
    [Platform Owner Only] Impersonates a specific employee by ID for deep debugging.
    """
    result = await service.impersonate_employee(employee_id)
    
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=settings.ENVIRONMENT != "development",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    target_employee = result["user"]
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": {
            "id": target_employee.id,
            "email": target_employee.email,
            "name": target_employee.name,
            "role": target_employee.role,
            "department": target_employee.department,
            "organization_id": target_employee.organization_id
        }
    }
