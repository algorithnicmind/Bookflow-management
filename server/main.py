import os
import socket

# Monkey-patch socket.getaddrinfo to force IPv4 and prevent Neon DB connection hangs over IPv6
original_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4

from datetime import datetime
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base

# Import all models to ensure they are registered on Base.metadata
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.modules.settings.models import SystemSetting
from app.modules.notifications.models import Notification

from app.modules.auth.routes import router as auth_router
from app.modules.employees.routes import router as employees_router
from app.modules.leaves.routes import router as leaves_router
from app.modules.dashboard.routes import router as dashboard_router
from app.modules.settings.routes import router as settings_router
from app.modules.reports.routes import router as reports_router
from app.modules.notifications.routes import router as notifications_router
from bot.router import router as bot_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB (Creates tables automatically if they don't exist)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_demo_users()
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
    allow_origins=["*"], # In production, restrict to actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import pwd_context

async def seed_demo_users():
    async with AsyncSessionLocal() as db:
        admin_res = await db.execute(select(Employee).where(Employee.email == "admin@company.com"))
        if not admin_res.scalar_one_or_none():
            db.add(Employee(
                name="Admin User",
                email="admin@company.com",
                password_hash=pwd_context.hash("password123"),
                role="admin",
                department=None,
                gender="male",
                is_active=True
            ))
            manager_demo = Employee(
                name="Alice Manager",
                email="alice@company.com",
                password_hash=pwd_context.hash("password123"),
                role="manager",
                department="Engineering",
                gender="female",
                is_active=True
            )
            db.add(manager_demo)
            await db.flush()

            emp_demo = Employee(
                name="John Doe",
                email="john@company.com",
                password_hash=pwd_context.hash("password123"),
                role="employee",
                department="Engineering",
                gender="male",
                is_active=True,
                manager_id=manager_demo.id
            )
            db.add(emp_demo)
            await db.commit()

            # Also create leave balances for demo users
            current_year = datetime.today().year
            for user_email in ["admin@company.com", "alice@company.com", "john@company.com"]:
                user_result = await db.execute(select(Employee).where(Employee.email == user_email))
                user = user_result.scalar_one_or_none()
                if user:
                    for leave_type, days in [("casual", 12), ("sick", 12), ("earned", 18), ("maternity", 182), ("miscarriage", 42)]:
                        balance = LeaveBalance(employee_id=user.id, leave_type=leave_type, total_days=days, year=current_year)
                        db.add(balance)
            await db.commit()

# Startup event replaced by lifespan

app.include_router(auth_router)
app.include_router(employees_router)
app.include_router(leaves_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(bot_router)

@app.get("/")
def root():
    return {"message": "Leave Management API is running"}
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

