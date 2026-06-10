import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base

# Import all models to ensure they are registered on Base.metadata
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance

from app.modules.auth.routes import router as auth_router
from app.modules.employees.routes import router as employees_router
from app.modules.leaves.routes import router as leaves_router
from app.modules.dashboard.routes import router as dashboard_router

app = FastAPI(
    title="Leave Management System API",
    version="1.0",
    description="API for managing employee leaves, approvals, and balances."
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
        admin_res = await db.execute(select(Employee).where(Employee.email == "admin@leaveflow.com"))
        if not admin_res.scalar_one_or_none():
            db.add(Employee(
                name="Admin Demo",
                email="admin@leaveflow.com",
                password_hash=pwd_context.hash("admin123"),
                role="admin",
                department="Management",
                is_active=True
            ))
            db.add(Employee(
                name="Manager Demo",
                email="manager@leaveflow.com",
                password_hash=pwd_context.hash("pass123"),
                role="manager",
                department="Engineering",
                is_active=True
            ))
            db.add(Employee(
                name="Employee Demo",
                email="employee1@leaveflow.com",
                password_hash=pwd_context.hash("pass123"),
                role="employee",
                department="Engineering",
                is_active=True
            ))
            await db.commit()

@app.on_event("startup")
async def startup_event():
    # Initialize DB (Creates tables automatically if they don't exist)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_demo_users()

app.include_router(auth_router)
app.include_router(employees_router)
app.include_router(leaves_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"message": "Leave Management API is running"}
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

