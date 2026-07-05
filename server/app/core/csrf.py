import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import logging
from app.core.config import settings

logger = logging.getLogger("leaveflow.csrf")

class CSRFMiddleware(BaseHTTPMiddleware):
    """
    Middleware to implement Double-Submit Cookie CSRF protection.
    It expects a 'X-CSRF-Token' header in all state-changing requests (POST, PUT, PATCH, DELETE),
    and validates it against the 'csrf_token' cookie.
    """
    async def dispatch(self, request: Request, call_next):
        # 1. Skip CSRF validation for safe methods
        if request.method in ("GET", "HEAD", "OPTIONS"):
            response = await call_next(request)
            return self._ensure_csrf_cookie(request, response)

        # 2. Skip validation for specific routes
        exempt_paths = [
            "/api/auth/login",
            "/api/auth/oauth-login",
            "/api/auth/google/callback",
            "/docs",
            "/openapi.json",
            "/redoc"
        ]
        
        if request.url.path in exempt_paths or request.url.path.startswith("/api/auth/google/"):
            response = await call_next(request)
            return self._ensure_csrf_cookie(request, response)
            
        # 3. Validate CSRF token
        csrf_cookie = request.cookies.get("csrf_token")
        csrf_header = request.headers.get("X-CSRF-Token")

        if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
            logger.warning(f"CSRF token mismatch or missing for path {request.url.path}. Cookie: {csrf_cookie}, Header: {csrf_header}")
            return JSONResponse(
                status_code=403,
                content={
                    "error": "CSRF_VERIFICATION_FAILED",
                    "message": "CSRF token verification failed.",
                    "request_id": getattr(request.state, "request_id", None)
                }
            )

        response = await call_next(request)
        return self._ensure_csrf_cookie(request, response)

    def _ensure_csrf_cookie(self, request: Request, response: Response) -> Response:
        """
        Ensures that every response sets the CSRF token cookie if it doesn't already exist.
        The frontend must read this cookie (since it's NOT HttpOnly) and send it as the X-CSRF-Token header.
        """
        if "csrf_token" not in request.cookies:
            new_token = uuid.uuid4().hex
            response.set_cookie(
                key="csrf_token",
                value=new_token,
                httponly=False,
                samesite="lax",
                secure=settings.ENVIRONMENT != "development",
                max_age=86400 # 24 hours
            )
        return response
