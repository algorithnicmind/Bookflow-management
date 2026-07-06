from datetime import datetime, timedelta, timezone
import asyncio
import logging
import threading
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from app.core.security import pwd_context, create_access_token
from app.core.config import settings
from app.modules.employees.models import Employee, PlatformOwner
from app.modules.leaves.models import LeaveBalance
from app.modules.auth.schemas import AdminCreateRequest
from app.modules.auth.repositories import AuthRepository

logger = logging.getLogger("leaveflow.auth")


class LoginAttemptTracker:
    """
    In-memory progressive brute-force lockout.
    Thread-safe dict tracks failed attempts per email with escalating cooldowns.
    
    Lockout schedule (configurable via settings):
        5 failures  → 1 min lockout
        10 failures → 5 min lockout
        20 failures → 30 min lockout (capped)
    
    NOTE: This is process-local. For multi-worker deployments, migrate to Redis.
    """
    def __init__(self):
        self._lock = threading.Lock()
        # {email: {"count": int, "locked_until": datetime | None}}
        self._attempts: dict = {}

    def check_lockout(self, email: str) -> None:
        """Raises HTTPException if the email is currently locked out."""
        with self._lock:
            record = self._attempts.get(email)
            if not record:
                return
            locked_until = record.get("locked_until")
            if locked_until and datetime.now(timezone.utc) < locked_until:
                remaining = int((locked_until - datetime.now(timezone.utc)).total_seconds())
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many failed attempts. Account locked for {remaining} seconds. Try again later."
                )
            # If lockout expired, leave record for count tracking
    
    def record_failure(self, email: str) -> None:
        """Records a failed login and applies progressive lockout if threshold met."""
        with self._lock:
            if email not in self._attempts:
                self._attempts[email] = {"count": 0, "locked_until": None}
            self._attempts[email]["count"] += 1
            count = self._attempts[email]["count"]
            
            # Progressive lockout escalation
            if count >= 20:
                lockout_mins = 30
            elif count >= 10:
                lockout_mins = settings.LOCKOUT_ESCALATION_FACTOR
            elif count >= settings.FAILED_LOGIN_MAX_ATTEMPTS:
                lockout_mins = settings.LOCKOUT_DURATION_MINUTES
            else:
                return  # Not enough failures yet
            
            self._attempts[email]["locked_until"] = (
                datetime.now(timezone.utc) + timedelta(minutes=lockout_mins)
            )
            logger.warning(
                f"Account locked: email={email}, attempts={count}, lockout_mins={lockout_mins}"
            )
    
    def reset(self, email: str) -> None:
        """Clears the failure counter on successful login."""
        with self._lock:
            self._attempts.pop(email, None)


# Module-level singleton — shared across all AuthService instances within this worker
_login_tracker = LoginAttemptTracker()


class AuthService:
    """
    Authentication Service Layer
    ----------------------------
    Handles business logic for user authentication, session validation, OAuth processing,
    and administrative impersonation.
    """
    def __init__(self, repo: AuthRepository):
        self.repo = repo

    async def authenticate_user(
        self, username: str, password_plain: str,
        ip_address: str = None, user_agent: str = None
    ) -> Employee | PlatformOwner:
        """
        Validates email and password against the database.
        Checks standard Employees first, then falls back to Platform Owners.
        Enforces progressive brute-force lockout and logs failures to audit_logs.
        """
        # 1. Check if the email is currently locked out
        _login_tracker.check_lockout(username)

        try:
            user = await self.repo.get_employee_by_email(username)
            if not user:
                user = await self.repo.get_platform_owner_by_email(username)
        except SQLAlchemyError as e:
            logger.error(f"Database error during user lookup for {username}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable. Please try again later."
            )
            
        if not user:
            # Log the failed attempt for security auditing
            await self._log_auth_failure(username, ip_address, user_agent, "user_not_found")
            _login_tracker.record_failure(username)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
            
        # Verify bcrypt hash securely in a background thread to prevent blocking the async event loop
        try:
            is_valid = await asyncio.to_thread(pwd_context.verify, password_plain, user.password_hash)
        except Exception as e:
            logger.error(f"Password verification error for {username}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable. Please try again later."
            )

        if not is_valid:
            await self._log_auth_failure(username, ip_address, user_agent, "invalid_password")
            _login_tracker.record_failure(username)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
            
        # Ensure the account hasn't been soft-deleted or suspended
        if not user.is_active:
            await self._log_auth_failure(username, ip_address, user_agent, "account_deactivated")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
        
        # Successful login — reset lockout counter and update last_login
        _login_tracker.reset(username)
        user.last_login = datetime.now(timezone.utc)
        try:
            await self.repo.commit()
        except SQLAlchemyError as e:
            logger.error(f"Database error during login commit for {username}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable. Please try again later."
            )
        
        # Log successful login to audit trail
        await self._log_auth_success(user, ip_address)
        
        return user

    async def _log_auth_failure(self, email: str, ip_address: str, user_agent: str, reason: str) -> None:
        """Records a failed authentication attempt in the audit log table."""
        try:
            from app.modules.audit.services import AuditLogService
            await AuditLogService.log_action(
                db=self.repo.db,
                actor_id=None,
                action="login_failed",
                target_type="auth",
                target_id=email,
                details={"reason": reason, "user_agent": user_agent},
                ip_address=ip_address
            )
            await self.repo.db.flush()
        except Exception:
            # Auth logging must never break the login flow
            logger.error(f"Failed to log auth failure for {email}", exc_info=True)

    async def _log_auth_success(self, user, ip_address: str) -> None:
        """Records a successful login in the audit log table."""
        try:
            from app.modules.audit.services import AuditLogService
            await AuditLogService.log_action(
                db=self.repo.db,
                actor_id=user.id,
                action="login_success",
                target_type="auth",
                target_id=str(user.id),
                details={"email": user.email, "role": user.role},
                ip_address=ip_address
            )
            await self.repo.db.flush()
        except Exception:
            logger.error(f"Failed to log auth success for {user.email}", exc_info=True)

    async def register_admin_user(self, request: AdminCreateRequest, org_id: int) -> Employee:
        """
        Creates a new admin-level employee within a specific tenant.
        Automatically provisions their default leave balances for the current year.
        """
        if await self.repo.get_employee_by_email(request.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
            
        hashed_password = await asyncio.to_thread(pwd_context.hash, request.password)
        
        new_employee = Employee(
            organization_id=org_id,
            name=request.name,
            email=request.email,
            password_hash=hashed_password,
            role="admin", # Hardcoded elevated role
            department=None,
            gender=request.gender
        )
        
        await self.repo.add_employee(new_employee)
        
        # Provision default leave balances (this should ideally read from settings, 
        # but is hardcoded here for initial rapid provisioning).
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
        """
        Validates an existing JWT token to restore a user session on the frontend.
        Resolves the user's organization name if they belong to a tenant.
        """
        from jose import jwt, JWTError
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get("sub")
            if not email:
                return {"user": None}
        except JWTError:
            return {"user": None} # Silent failure: Token expired or invalid signature

        user = await self.repo.get_employee_by_email(email)
        if user is None:
            user = await self.repo.get_platform_owner_by_email(email)

        if user is None or not user.is_active:
            return {"user": None}

        # Platform owners have a slightly different schema (no organization)
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

        # Standard employees need their tenant name resolved for UI display
        from app.modules.employees.schemas import EmployeeResponse
        resp = EmployeeResponse.model_validate(user)
        
        if user.organization_id:
            from app.core.tenant import get_current_tenant
            try:
                # Mock a request-like context to fetch tenant cleanly using existing dependency logic
                tenant = await get_current_tenant(user, self.repo.db)
                resp.organization_name = tenant.name
            except Exception:
                pass # Graceful degradation if tenant is suspended

        return {"user": resp}

    async def oauth_login(self, email: str) -> dict:
        """
        Processes an OAuth login attempt.
        If the email matches an active employee, generates a JWT session.
        If it matches a pending onboarding application, returns a contextual error.
        """
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
            
        # Check if they are a lead waiting for approval
        application = await self.repo.get_pending_application_by_email(email)
        if application:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "Your application is still pending approval.",
                    "onboarding_status": "pending"
                }
            )
            
        # Completely unknown email
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "You are not registered. Please complete the onboarding application.",
                "onboarding_status": "required",
                "email": email
            }
        )

    async def upload_avatar(self, current_user: Employee | PlatformOwner, filename: str, content_type: str, file_data: bytes, base_url: str) -> str:
        """
        Processes a profile picture upload and saves the binary data to the DB.
        """
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
        
        # Construct the API route URL that serves this image dynamically
        url = f"{base_url}/api/uploads/{image.id}"
        target_user.profile_image_url = url
        await self.repo.commit()
        return url

    async def impersonate_tenant(self, org_id: int) -> dict:
        """
        Allows a Platform Owner to securely log in as the primary Super Admin of a specific tenant.
        This is a critical debugging feature that bypasses passwords.
        """
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
        """
        Allows a Platform Owner to securely log in as a specific employee for deep debugging.
        """
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
