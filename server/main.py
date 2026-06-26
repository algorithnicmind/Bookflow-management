import os
import socket

# Monkey-patch socket.getaddrinfo to force IPv4 and prevent Neon DB connection hangs over IPv6
original_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4

from datetime import datetime
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.dependencies import limiter
from app.core.config import settings

# Import all models to ensure they are registered on Base.metadata
from app.modules.organizations.models import Organization, OnboardingApplication, RolePermission
from app.modules.employees.models import Employee, PlatformOwner, EmployeeImage
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.modules.settings.models import SystemSetting, PlatformConfig
from app.modules.notifications.models import Notification
from app.modules.audit.models import AuditLog
from app.modules.integrations.models import CalendarIntegration

from app.modules.contact.models import ContactMessage

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

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB (Only auto-create tables in development; use Alembic migrations in production)
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
            # Migration to add access_days and expires_at to organizations
            from sqlalchemy import text
            try:
                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='organizations' AND column_name='access_days';
                """))
                if not res.scalar():
                    print("Adding column access_days to organizations...")
                    await conn.execute(text("ALTER TABLE organizations ADD COLUMN access_days INTEGER DEFAULT 30;"))
                
                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='organizations' AND column_name='expires_at';
                """))
                if not res.scalar():
                    print("Adding column expires_at to organizations...")
                    await conn.execute(text("ALTER TABLE organizations ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;"))

                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='organizations' AND column_name='module_access';
                """))
                if not res.scalar():
                    print("Adding column module_access to organizations...")
                    await conn.execute(text("ALTER TABLE organizations ADD COLUMN module_access JSON;"))

                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='organizations' AND column_name='max_employees';
                """))
                if not res.scalar():
                    print("Adding column max_employees to organizations...")
                    await conn.execute(text("ALTER TABLE organizations ADD COLUMN max_employees INTEGER;"))

                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='onboarding_applications' AND column_name='selected_plan';
                """))
                if not res.scalar():
                    print("Adding column selected_plan to onboarding_applications...")
                    await conn.execute(text("ALTER TABLE onboarding_applications ADD COLUMN selected_plan VARCHAR(50) DEFAULT 'free_trial';"))

                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='employees' AND column_name='profile_image_url';
                """))
                if not res.scalar():
                    print("Adding column profile_image_url to employees...")
                    await conn.execute(text("ALTER TABLE employees ADD COLUMN profile_image_url VARCHAR(255);"))

                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='platform_owners' AND column_name='profile_image_url';
                """))
                if not res.scalar():
                    print("Adding column profile_image_url to platform_owners...")
                    await conn.execute(text("ALTER TABLE platform_owners ADD COLUMN profile_image_url VARCHAR(255);"))
                    
                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='employees' AND column_name='last_login';
                """))
                if not res.scalar():
                    print("Adding column last_login to employees...")
                    await conn.execute(text("ALTER TABLE employees ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;"))

                # Auto-create employee_images table (simple check if table exists)
                res = await conn.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_name='employee_images';
                """))
                if not res.scalar():
                    print("Creating employee_images table...")
                    await conn.execute(text("""
                        CREATE TABLE employee_images (
                            id SERIAL PRIMARY KEY,
                            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                            platform_owner_id INTEGER REFERENCES platform_owners(id) ON DELETE CASCADE,
                            filename VARCHAR(255) NOT NULL,
                            file_data BYTEA NOT NULL,
                            mime_type VARCHAR(50) NOT NULL,
                            file_size INTEGER NOT NULL,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        );
                    """))
                    await conn.execute(text("CREATE INDEX ix_employee_images_employee_id ON employee_images(employee_id);"))
                    await conn.execute(text("CREATE INDEX ix_employee_images_platform_owner_id ON employee_images(platform_owner_id);"))
                    
                res = await conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='platform_owners' AND column_name='last_login';
                """))
                if not res.scalar():
                    print("Adding column last_login to platform_owners...")
                    await conn.execute(text("ALTER TABLE platform_owners ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;"))
            except Exception as e:
                print(f"Migration error: {e}")

            # Seed default Platform Owner
            from sqlalchemy.future import select
            from app.modules.employees.models import PlatformOwner
            from app.core.security import pwd_context

            res = await conn.execute(select(PlatformOwner))
            if not res.scalars().first():
                print("Seeding default Platform Owner...")
                hashed_password = pwd_context.hash("Owner@123!")
                # Insert directly to avoid session management issues in lifespan
                await conn.execute(text("""
                    INSERT INTO platform_owners (name, email, password_hash, role, department, is_active)
                    VALUES ('Platform Owner', 'owner@leaveflow.com', :pwd, 'platform_owner', 'System', true)
                """), {"pwd": hashed_password})

    # Migrate existing local uploads to database
    async with AsyncSessionLocal() as session:
        uploads_dir = "uploads"
        if os.path.isdir(uploads_dir):
            local_files = os.listdir(uploads_dir)
            if local_files:
                print(f"Migrating {len(local_files)} local upload(s) to database...")
                for filename in local_files:
                    filepath = os.path.join(uploads_dir, filename)
                    if not os.path.isfile(filepath):
                        continue

                    old_url_suffix = f"/uploads/{filename}"

                    emp_res = await session.execute(
                        select(Employee).where(Employee.profile_image_url.like(f"%{old_url_suffix}"))
                    )
                    emp = emp_res.scalar_one_or_none()

                    po_res = await session.execute(
                        select(PlatformOwner).where(PlatformOwner.profile_image_url.like(f"%{old_url_suffix}"))
                    )
                    po = po_res.scalar_one_or_none()

                    with open(filepath, "rb") as f:
                        file_data = f.read()

                    ext = filename.split(".")[-1].lower()
                    mime_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"}
                    mime_type = mime_map.get(ext, "image/jpeg")

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

                    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
                    new_url = f"{BACKEND_URL}/api/uploads/{image.id}"
                    if emp:
                        emp.profile_image_url = new_url
                    if po:
                        po.profile_image_url = new_url

                    os.remove(filepath)

                await session.commit()

                if os.path.isdir(uploads_dir) and not os.listdir(uploads_dir):
                    os.rmdir(uploads_dir)
                print("Local upload migration complete.")

    from app.modules.leaves.cron import start_scheduler
    start_scheduler()

    yield

app = FastAPI(
    title="Leave Management System API",
    version="1.0",
    description="API for managing employee leaves, approvals, and balances.",
    lifespan=lifespan
)

# Configure CORS (from TRD)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000", "https://leaveflow.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/")
def root():
    return {"message": "Leave Management API is running"}
    
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
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

