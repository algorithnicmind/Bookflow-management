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
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.database import engine, Base

# Import all models to ensure they are registered on Base.metadata
from app.modules.organizations.models import Organization, OnboardingApplication
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.modules.settings.models import SystemSetting
from app.modules.notifications.models import Notification
from app.modules.audit.models import AuditLog
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

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB (Creates tables automatically if they don't exist)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
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
    allow_origins=["http://localhost:3000", "https://leaveflow.com"], # Restrict to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import pwd_context



# Startup event replaced by lifespan

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

@app.get("/")
def root():
    return {"message": "Leave Management API is running"}
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

