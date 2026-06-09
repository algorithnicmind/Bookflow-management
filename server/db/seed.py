import asyncio
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import os
import sys

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance
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
            department="Management"
        )
        session.add(super_admin)
        
        # Create Admin
        admin = Employee(
            name="Admin User",
            email="admin@company.com",
            password_hash=pwd_context.hash("password123"),
            role="admin",
            department="Management"
        )
        session.add(admin)
        await session.commit()
        
        # Create Managers
        manager_alice = Employee(
            name="Alice Manager",
            email="alice@company.com",
            password_hash=pwd_context.hash("password123"),
            role="manager",
            department="Engineering"
        )
        manager_bob = Employee(
            name="Bob Manager",
            email="bob@company.com",
            password_hash=pwd_context.hash("password123"),
            role="manager",
            department="Design"
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
            manager_id=manager_alice.id
        )
        employee_jane = Employee(
            name="Jane Doe",
            email="jane@company.com",
            password_hash=pwd_context.hash("password123"),
            role="employee",
            department="Design",
            manager_id=manager_bob.id
        )
        session.add_all([employee_john, employee_jane])
        await session.commit()
        
        # Initialize Leave Balances for 2026 for all users
        all_users = [super_admin, admin, manager_alice, manager_bob, employee_john, employee_jane]
        for user in all_users:
            for leave_type, days in [("casual", 12), ("sick", 10), ("earned", 15)]:
                balance = LeaveBalance(
                    employee_id=user.id,
                    leave_type=leave_type,
                    total_days=days,
                    year=2026
                )
                session.add(balance)
                
        await session.commit()
        print("Successfully seeded database with all Demo Credentials from README!")

if __name__ == "__main__":
    asyncio.run(seed_data())
