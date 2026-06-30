from datetime import datetime, timedelta, timezone
import asyncio
from fastapi import HTTPException, status
from app.core.security import pwd_context, create_access_token
from app.core.config import settings
from app.modules.employees.models import Employee, PlatformOwner
from app.modules.leaves.models import LeaveBalance
from app.modules.auth.schemas import AdminCreateRequest
from app.modules.auth.repositories import AuthRepository

class AuthService:
    def __init__(self, repo: AuthRepository):
        self.repo = repo

    async def authenticate_user(self, username: str, password_plain: str) -> Employee | PlatformOwner:
        user = await self.repo.get_employee_by_email(username)
        if not user:
            user = await self.repo.get_platform_owner_by_email(username)
            
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
            
        is_valid = await asyncio.to_thread(pwd_context.verify, password_plain, user.password_hash)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
            
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
            
        user.last_login = datetime.now(timezone.utc)
        await self.repo.commit()
        return user

    async def register_admin_user(self, request: AdminCreateRequest, org_id: int) -> Employee:
        if await self.repo.get_employee_by_email(request.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
            
        hashed_password = await asyncio.to_thread(pwd_context.hash, request.password)
        
        new_employee = Employee(
            organization_id=org_id,
            name=request.name,
            email=request.email,
            password_hash=hashed_password,
            role="admin",
            department=None,
            gender=request.gender
        )
        
        await self.repo.add_employee(new_employee)
        
        current_year = datetime.now().year
        for leave_type, days in [("casual", 12), ("sick", 12), ("earned", 18), ("maternity", 182), ("miscarriage", 42)]:
            balance = LeaveBalance(
                organization_id=org_id, 
                employee_id=new_employee.id, 
                leave_type=leave_type, 
                total_days=days, 
                year=current_year
            )
            self.repo.db.add(balance)
            
        await self.repo.commit()
        return new_employee

    async def check_session(self, token: str) -> dict:
        from jose import jwt, JWTError
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get("sub")
            if not email:
                return {"user": None}
        except JWTError:
            return {"user": None}

        user = await self.repo.get_employee_by_email(email)
        if user is None:
            user = await self.repo.get_platform_owner_by_email(email)

        if user is None or not user.is_active:
            return {"user": None}

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
            from app.core.tenant import get_current_tenant
            try:
                # We can mock a minimal object to fetch tenant
                tenant = await get_current_tenant(user, self.repo.db)
                resp.organization_name = tenant.name
            except Exception:
                pass

        return {"user": resp}

    async def oauth_login(self, email: str) -> dict:
        user = await self.repo.get_employee_by_email(email)
        
        if user:
            if not user.is_active:
                raise HTTPException(status_code=403, detail="Account is deactivated")
            
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email, "id": user.id, "role": user.role},
                expires_delta=access_token_expires
            )
            
            user.last_login = datetime.now(timezone.utc)
            await self.repo.commit()
            return {
                "access_token": access_token,
                "user": user
            }
            
        application = await self.repo.get_pending_application_by_email(email)
        if application:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "Your application is still pending approval.",
                    "onboarding_status": "pending"
                }
            )
            
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "You are not registered. Please complete the onboarding application.",
                "onboarding_status": "required",
                "email": email
            }
        )

    async def upload_avatar(self, current_user: Employee | PlatformOwner, filename: str, content_type: str, file_data: bytes, base_url: str) -> str:
        if not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        is_po = isinstance(current_user, PlatformOwner)
        
        if is_po:
            target_user = await self.repo.get_platform_owner_by_id(current_user.id)
        else:
            target_user = await self.repo.get_employee_by_id(current_user.id)
            
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

        from app.modules.employees.models import EmployeeImage
        image = EmployeeImage(
            employee_id=None if is_po else current_user.id,
            platform_owner_id=current_user.id if is_po else None,
            filename=filename,
            file_data=file_data,
            mime_type=content_type,
            file_size=len(file_data),
        )
        
        await self.repo.add_employee_image(image)
        
        url = f"{base_url}/api/uploads/{image.id}"
        target_user.profile_image_url = url
        await self.repo.commit()
        return url

    async def impersonate_tenant(self, org_id: int) -> dict:
        target_admin = await self.repo.get_active_super_admin_by_org(org_id)
        if not target_admin:
            raise HTTPException(status_code=404, detail="No active super_admin found for this organization")
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": target_admin.email, "id": target_admin.id, "role": target_admin.role},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "user": target_admin
        }

    async def impersonate_employee(self, employee_id: int) -> dict:
        target_employee = await self.repo.get_active_employee_by_id(employee_id)
        if not target_employee:
            raise HTTPException(status_code=404, detail="Active employee not found")
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": target_employee.email, "id": target_employee.id, "role": target_employee.role},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "user": target_employee
        }
