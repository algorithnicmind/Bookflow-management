import os
import socket
import time
from uuid import uuid4

# Monkey-patch socket.getaddrinfo to force IPv4 and prevent Neon DB connection hangs over IPv6
# This is a known issue with some async Postgres drivers when IPv6 is preferred but not fully supported by the network/DB.
original_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    # Overrides the default address family to AF_INET (IPv4)
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4

from datetime import datetime
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy.future import select
from sqlalchemy import text
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.dependencies import limiter
from app.core.config import settings
from app.core.errors import APIError, api_error_handler
import logging
from fastapi.responses import JSONResponse

# Configure standard Python logging for the application
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("leaveflow")

# Import all models to ensure they are registered on Base.metadata before creating tables
from app.modules.organizations.models import Organization, OnboardingApplication, RolePermission
from app.modules.employees.models import Employee, PlatformOwner, EmployeeImage
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.modules.settings.models import SystemSetting, PlatformConfig
from app.modules.notifications.models import Notification
from app.modules.audit.models import AuditLog
from app.modules.integrations.models import CalendarIntegration
from app.modules.contact.models import ContactMessage

# Import all router modules which define the API endpoints for different features
from app.modules.auth.routes import router as auth_router
from app.modules.employees.routes import router as employees_router
from app.modules.leaves.routes import router as leaves_router
from app.modules.dashboard.routes import router as dashboard_router
from app.modules.settings.routes import router as settings_router
from app.modules.reports.routes import router as reports_router
from app.modules.notifications.routes import router as notifications_router
from app.modules.audit.routes import router as audit_router
from app.modules.contact.routes import router as contact_router
from app.modules.onboarding.routes import router as onboarding_router
from bot.router import router as bot_router
from app.modules.integrations.routes import router as integrations_router
from app.modules.uploads.routes import router as uploads_router
from app.modules.organizations.routes import router as organizations_router
from app.modules.health.routes import router as health_router

from contextlib import asynccontextmanager

# Reference to the scheduler for graceful shutdown
_scheduler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager runs startup and shutdown events.
    Startup: Initializes DB, seeds data, handles migrations, and starts background schedulers.
    Shutdown: Gracefully stops scheduler and disposes DB connections.
    """
    global _scheduler
    
    # Initialize DB (Only auto-create tables in development; use Alembic migrations in production)
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            # Create all tables defined in SQLAlchemy metadata
            await conn.run_sync(Base.metadata.create_all)
            
            # Seed default Platform Owner if it doesn't exist
            from sqlalchemy.future import select
            from app.modules.employees.models import PlatformOwner
            from app.core.security import pwd_context

            res = await conn.execute(select(PlatformOwner))
            if not res.scalars().first():
                print("Seeding default Platform Owner...")
                hashed_password = pwd_context.hash("Owner@123!")
                # Insert directly via SQL to avoid session management issues during app startup
                await conn.execute(text("""
                    INSERT INTO platform_owners (name, email, password_hash, role, department, is_active)
                    VALUES ('Platform Owner', 'owner@leaveflow.com', :pwd, 'platform_owner', 'System', true)
                """), {"pwd": hashed_password})

    # Migrate existing local file uploads to database storage
    async with AsyncSessionLocal() as session:
        uploads_dir = "uploads"
        # Check if the uploads directory exists on the filesystem
        if os.path.isdir(uploads_dir):
            local_files = os.listdir(uploads_dir)
            if local_files:
                print(f"Migrating {len(local_files)} local upload(s) to database...")
                # Loop through each file and migrate to EmployeeImage database model
                for filename in local_files:
                    filepath = os.path.join(uploads_dir, filename)
                    if not os.path.isfile(filepath):
                        continue

                    old_url_suffix = f"/uploads/{filename}"

                    # Check if any employee is referencing this image
                    emp_res = await session.execute(
                        select(Employee).where(Employee.profile_image_url.like(f"%{old_url_suffix}"))
                    )
                    emp = emp_res.scalar_one_or_none()

                    # Check if any platform owner is referencing this image
                    po_res = await session.execute(
                        select(PlatformOwner).where(PlatformOwner.profile_image_url.like(f"%{old_url_suffix}"))
                    )
                    po = po_res.scalar_one_or_none()

                    # Read file binary data
                    with open(filepath, "rb") as f:
                        file_data = f.read()

                    # Determine MIME type based on file extension
                    ext = filename.split(".")[-1].lower()
                    mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"}
                    mime_type = mime_map.get(ext, "image/jpeg")

                    # Create and store the new image record in the database
                    image = EmployeeImage(
                        employee_id=emp.id if emp else None,
                        platform_owner_id=po.id if po else None,
                        filename=filename,
                        file_data=file_data,
                        mime_type=mime_type,
                        file_size=len(file_data),
                    )
                    session.add(image)
                    await session.flush()

                    # Update user profile URLs to point to the new dynamic API endpoint
                    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
                    new_url = f"{BACKEND_URL}/api/uploads/{image.id}"
                    if emp:
                        emp.profile_image_url = new_url
                    if po:
                        po.profile_image_url = new_url

                    # Remove the physical file after successful migration
                    os.remove(filepath)

                await session.commit()

                # Clean up the uploads directory if it is now empty
                if os.path.isdir(uploads_dir) and not os.listdir(uploads_dir):
                    os.rmdir(uploads_dir)
                print("Local upload migration complete.")
            else:
                # If directory is empty, clean any stale image URLs from DB
                print("Uploads directory empty, cleaning stale old-format URLs...")
                await session.execute(
                    text("UPDATE employees SET profile_image_url = NULL WHERE profile_image_url LIKE '%/uploads/%'")
                )
                await session.execute(
                    text("UPDATE platform_owners SET profile_image_url = NULL WHERE profile_image_url LIKE '%/uploads/%'")
                )
                await session.commit()
        else:
            # If no directory exists, ensure no user is referencing stale local paths
            print("No uploads directory found, cleaning stale old-format URLs...")
            await session.execute(
                text("UPDATE employees SET profile_image_url = NULL WHERE profile_image_url LIKE '%/uploads/%'")
            )
            await session.execute(
                text("UPDATE platform_owners SET profile_image_url = NULL WHERE profile_image_url LIKE '%/uploads/%'")
            )
            await session.commit()

    # Start the background cron scheduler for automated leave accruals and reminders
    from app.modules.leaves.cron import start_scheduler, scheduler
    start_scheduler()
    _scheduler = scheduler

    # Yield control back to FastAPI (application runs during this time)
    yield
    
    # === Graceful Shutdown ===
    # Stop the APScheduler, waiting for running jobs to complete
    if _scheduler and _scheduler.running:
        logger.info("Shutting down APScheduler...")
        _scheduler.shutdown(wait=True)
    
    # Dispose the async engine to close all DB connections cleanly
    logger.info("Disposing database engine...")
    await engine.dispose()
    logger.info("Shutdown complete.")

# Initialize FastAPI application instance
# Conditionally disable OpenAPI docs in production to prevent API structure leakage
app = FastAPI(
    title="Leave Management System API",
    version="1.0",
    description="API for managing employee leaves, approvals, and balances.",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
)

# Configure CORS (Cross-Origin Resource Sharing) to allow frontend access
# Uses explicit methods and headers instead of wildcards for security hardening
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token", "X-Request-ID"],
)

# GZip compression — reduces bandwidth by 70-80% for JSON responses
app.add_middleware(GZipMiddleware, minimum_size=500)

# Attach rate limiter to app state and register its exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Register standardized APIError exception handler
app.add_exception_handler(APIError, api_error_handler)

# Global exception handler for unexpected server errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": request_id,
        }
    )


# === Security & Observability Middleware ===

@app.middleware("http")
async def combined_middleware(request: Request, call_next):
    """
    Combined middleware for performance and security.
    Handles: Request-ID tracing, response time monitoring, security headers, request size limiting.
    """
    # --- Request-ID Tracing ---
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    request.state.request_id = request_id
    
    # --- Request Size Limiting (skip file uploads which have their own validation) ---
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > settings.MAX_REQUEST_SIZE_BYTES:
        return JSONResponse(
            status_code=413,
            content={
                "error": "PAYLOAD_TOO_LARGE",
                "message": f"Request body exceeds maximum size of {settings.MAX_REQUEST_SIZE_BYTES // (1024 * 1024)}MB",
                "request_id": request_id,
            }
        )
    
    # --- Response Time Monitoring ---
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Log slow requests (>1 second)
    if duration > 1.0:
        logger.warning(f"Slow request: {request.method} {request.url.path} took {duration:.2f}s [request_id={request_id}]")
    
    # --- Attach Response Headers ---
    # Tracing & performance
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration:.3f}s"
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    
    return response


# Basic health check endpoint (legacy — detailed health at /api/health)
@app.get("/")
def root():
    return {"message": "Leave Management API is running"}
    
# Register all modular routers to the main FastAPI application
app.include_router(auth_router)
app.include_router(employees_router)
app.include_router(leaves_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(audit_router)
app.include_router(contact_router)
app.include_router(onboarding_router)
app.include_router(bot_router)
app.include_router(integrations_router)
app.include_router(uploads_router)
app.include_router(organizations_router)
app.include_router(health_router)
    
# Entry point for running the application via Uvicorn programmatically
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

