"""
Authentication API Routes
-------------------------
This module defines the API endpoints responsible for logging users in, 
registering new tenant administrators, and managing HTTP-only session cookies.
It includes rate-limiting to prevent brute force attacks.
"""
from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, status, HTTPException, Response, Request, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, pwd_context
from app.core.dependencies import PermissionChecker
from app.modules.employees.models import Employee
from app.modules.auth.schemas import Token, AdminCreateRequest
from app.modules.auth.services import authenticate_user, register_admin_user
from pydantic import BaseModel, EmailStr

from app.core.tenant import get_current_tenant
from app.modules.organizations.models import Organization
from app.core.dependencies import limiter
from app.modules.employees.models import EmployeeImage

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/session")
async def check_session(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Lightweight session check endpoint.
    Returns 200 with user data if logged in, or 200 with null if not.
    Never returns 401, so the browser console stays clean.
    """
    from jose import jwt, JWTError
    from app.modules.employees.models import PlatformOwner

    token = request.cookies.get("access_token")
    if not token:
        return {"user": None}

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email = payload.get("sub")
        if not email:
            return {"user": None}
    except JWTError:
        return {"user": None}

    result = await db.execute(select(Employee).where(Employee.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        po_res = await db.execute(select(PlatformOwner).where(PlatformOwner.email == email))
        user = po_res.scalar_one_or_none()

    if user is None or not user.is_active:
        return {"user": None}

    # PlatformOwner doesn't have Employee-specific fields (manager_id, gender, etc.)
    # so build response manually to avoid model_validate failure
    if isinstance(user, PlatformOwner):
        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "department": user.department,
                "is_active": user.is_active,
                "profile_image_url": user.profile_image_url,
                "organization_name": None,
            }
        }

    from app.modules.employees.schemas import EmployeeResponse
    resp = EmployeeResponse.model_validate(user)

    if user.organization_id:
        try:
            tenant = await get_current_tenant(user, db)
            resp.organization_name = tenant.name
        except Exception:
            pass

    return {"user": resp}

class OAuthRequest(BaseModel):
    email: EmailStr
    provider: str # google, facebook

@router.post("/oauth-login")
async def oauth_login(request: OAuthRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """
    OAuth Login Handler.
    Used by the frontend when logging in via third-party providers (Google/Facebook).
    Checks if the email belongs to an active Employee. If so, issues an HttpOnly cookie.
    """
    from sqlalchemy.future import select
    from app.modules.organizations.models import OnboardingApplication
    
    # 1. Check if user exists as an Employee
    result = await db.execute(select(Employee).where(Employee.email == request.email))
    user = result.scalar_one_or_none()
    
    if user:
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is deactivated")
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "id": user.id, "role": user.role},
            expires_delta=access_token_expires
        )
        
        user.last_login = datetime.now(timezone.utc)
        await db.commit()
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
                "department": user.department,
                "profile_image_url": getattr(user, "profile_image_url", None)
            }
        }
        
    # 2. Check if they have a pending application
    app_res = await db.execute(select(OnboardingApplication).where(OnboardingApplication.super_admin_email == request.email))
    application = app_res.scalar_one_or_none()
    
    if application:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Your application is still pending approval.",
                "onboarding_status": "pending"
            }
        )
        
    # 3. Otherwise, they need to apply
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "message": "You are not registered. Please complete the onboarding application.",
            "onboarding_status": "required",
            "email": request.email
        }
    )

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login_for_access_token(
    request: Request,
    response: Response, 
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    """
    Standard Email/Password Login Handler.
    - Rate Limited to 5 requests per minute to prevent brute-force attacks.
    - Authenticates the user credentials against the database.
    - Generates a JWT access token containing the user's ID, email, and Role.
    - Sets the token as a secure HttpOnly cookie to prevent XSS attacks.
    """
    user = await authenticate_user(form_data.username, form_data.password, db)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    
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
            "department": user.department,
            "profile_image_url": getattr(user, "profile_image_url", None)
        }
    }

from app.core.dependencies import get_current_user
from app.modules.employees.models import PlatformOwner

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_data = await file.read()

    # Determine the target user (Employee or PlatformOwner) by ID lookup
    po_res = await db.execute(select(PlatformOwner).where(PlatformOwner.id == current_user.id))
    po_user = po_res.scalar_one_or_none()

    is_po = po_user is not None and po_user.email == current_user.email
    if not is_po:
        emp_res = await db.execute(select(Employee).where(Employee.id == current_user.id))
        emp_user = emp_res.scalar_one_or_none()
        if not emp_user:
            raise HTTPException(status_code=404, detail="User not found")

    employee_image = EmployeeImage(
        employee_id=None if is_po else current_user.id,
        platform_owner_id=current_user.id if is_po else None,
        filename=file.filename,
        file_data=file_data,
        mime_type=file.content_type,
        file_size=len(file_data),
    )
    db.add(employee_image)
    await db.flush()

    url = f"{BACKEND_URL}/api/uploads/{employee_image.id}"

    if is_po:
        po_user.profile_image_url = url
    else:
        emp_user.profile_image_url = url

    await db.commit()
    return {"profile_image_url": url}

import httpx
from fastapi.responses import RedirectResponse
import urllib.parse
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("NEXT_PUBLIC_FRONTEND_URL", "http://localhost:3000")

@router.get("/google/login")
async def oauth_login():
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
async def oauth_callback(code: str):
    redirect_uri = f"{BACKEND_URL}/api/auth/google/callback"
    token_url = "https://oauth2.googleapis.com/token"
    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"OAuth error: {resp.text}")
        
        access_token = resp.json().get("access_token")
        user_resp = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={"Authorization": f"Bearer {access_token}"})
        email = user_resp.json().get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

    # Redirect to frontend with the email
    frontend_url = f"{FRONTEND_URL}/onboarding/oauth-callback?email={urllib.parse.quote(email)}&provider=google"
    return RedirectResponse(url=frontend_url)

@router.post("/logout")
async def logout(response: Response):
    """
    Logout Handler.
    Simply deletes the HttpOnly `access_token` cookie, terminating the user's session.
    """
    response.delete_cookie(key="access_token", httponly=True, secure=settings.ENVIRONMENT != "development", samesite="lax")
    return {"message": "Logged out successfully"}

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_admin(
    request: AdminCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(PermissionChecker("manage_settings")),
    current_org: Organization = Depends(get_current_tenant)
):
    """
    Tenant Administrator Registration.
    Called when a new organization is approved and the primary admin account needs to be created.
    Requires an active Organization tenant context.
    """
    new_employee = await register_admin_user(request, current_org.id, db)
    
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

from app.core.dependencies import RequireOwner

@router.post("/impersonate/{org_id}", response_model=Token)
async def impersonate_tenant(
    org_id: int,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    """
    Impersonation API (Platform Owner only).
    Generates a login token for the target organization's super_admin.
    """
    # Find the super admin of the target organization
    res = await db.execute(select(Employee).where(
        (Employee.organization_id == org_id) & 
        (Employee.role == "super_admin") &
        (Employee.is_active == True)
    ))
    target_admin = res.scalars().first()
    
    if not target_admin:
        raise HTTPException(status_code=404, detail="No active super_admin found for this organization")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": target_admin.email, "id": target_admin.id, "role": target_admin.role},
        expires_delta=access_token_expires
    )
    
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
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    """
    Deep Impersonation API (Platform Owner only).
    Generates a login token for ANY specific employee in the system.
    """
    res = await db.execute(select(Employee).where(
        (Employee.id == employee_id) & 
        (Employee.is_active == True)
    ))
    target_employee = res.scalars().first()
    
    if not target_employee:
        raise HTTPException(status_code=404, detail="Active employee not found")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": target_employee.email, "id": target_employee.id, "role": target_employee.role},
        expires_delta=access_token_expires
    )
    
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
            "id": target_employee.id,
            "email": target_employee.email,
            "name": target_employee.name,
            "role": target_employee.role,
            "department": target_employee.department,
            "organization_id": target_employee.organization_id
        }
    }
