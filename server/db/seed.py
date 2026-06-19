import asyncio
import socket

# Monkey-patch socket.getaddrinfo to force IPv4 and prevent Neon DB connection hangs over IPv6
original_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4

from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import os
import sys


# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.modules.settings.models import SystemSetting, PublicHoliday, ApprovalChain, ApprovalStep
from app.modules.notifications.models import Notification
from app.modules.audit.models import AuditLog
from app.core.database import Base
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_data():
    engine = create_async_engine(settings.async_database_url, echo=True)
    
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        # Create Super Admin
        super_admin = Employee(
            name="Super Admin",
            email="superadmin@company.com",
            password_hash=pwd_context.hash("password123"),
            role="super_admin",
            department=None,
            gender="male"
        )
        session.add(super_admin)
        
        # Create Admin
        admin = Employee(
            name="Admin User",
            email="admin@company.com",
            password_hash=pwd_context.hash("password123"),
            role="admin",
            department=None,
            gender="male"
        )
        session.add(admin)
        await session.commit()
        
        # Create Managers
        manager_alice = Employee(
            name="Alice Manager",
            email="alice@company.com",
            password_hash=pwd_context.hash("password123"),
            role="manager",
            department="Engineering",
            gender="female"
        )
        manager_bob = Employee(
            name="Bob Manager",
            email="bob@company.com",
            password_hash=pwd_context.hash("password123"),
            role="manager",
            department="Design",
            gender="male"
        )
        session.add_all([manager_alice, manager_bob])
        await session.commit()
        
        # Create Employees
        employee_john = Employee(
            name="John Doe",
            email="john@company.com",
            password_hash=pwd_context.hash("password123"),
            role="employee",
            department="Engineering",
            manager_id=manager_alice.id,
            gender="male"
        )
        employee_jane = Employee(
            name="Jane Doe",
            email="jane@company.com",
            password_hash=pwd_context.hash("password123"),
            role="employee",
            department="Design",
            manager_id=manager_bob.id,
            gender="female"
        )
        session.add_all([employee_john, employee_jane])
        await session.commit()
        
        # Initialize Leave Balances for 2026 for all users
        all_users = [super_admin, admin, manager_alice, manager_bob, employee_john, employee_jane]
        for user in all_users:
            for leave_type, days in [("casual", 12), ("sick", 12), ("earned", 18), ("maternity", 182), ("miscarriage", 42)]:
                balance = LeaveBalance(
                    employee_id=user.id,
                    leave_type=leave_type,
                    total_days=days,
                    year=2026
                )
                session.add(balance)
        
        # Create LeavePolicies
        from app.modules.settings.models import LeavePolicy
        policies = [
            LeavePolicy(name="Global Earned Leave", department=None, role=None, leave_type="earned", base_days=18, accrual_rate=1.5, max_carry_forward=30),
            LeavePolicy(name="Engineering Extra Sick", department="Engineering", role=None, leave_type="sick", base_days=15, accrual_rate=0.0, max_carry_forward=0),
            LeavePolicy(name="Manager Casual", department=None, role="manager", leave_type="casual", base_days=15, accrual_rate=0.0, max_carry_forward=0)
        ]
        for p in policies:
            session.add(p)
            
        await session.commit()
        print("Successfully seeded database with all Demo Credentials from README!")

if __name__ == "__main__":
    asyncio.run(seed_data())
