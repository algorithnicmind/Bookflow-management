import asyncio
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import os
import sys

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import Base, Employee, LeaveBalance
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_data():
    connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
    engine = create_async_engine(settings.DATABASE_URL, echo=True, connect_args=connect_args)
    
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        # Create Super Admin
        super_admin = Employee(
            name="Super Admin",
            email="admin@demo.com",
            password_hash=pwd_context.hash("password123"),
            role="super_admin",
            department="Management"
        )
        session.add(super_admin)
        await session.commit()
        
        # Create a Manager
        manager = Employee(
            name="Alice Manager",
            email="alice@co.com",
            password_hash=pwd_context.hash("password123"),
            role="manager",
            department="Engineering"
        )
        session.add(manager)
        await session.commit()
        
        # Create an Employee reporting to Manager
        employee = Employee(
            name="John Doe",
            email="john@co.com",
            password_hash=pwd_context.hash("password123"),
            role="employee",
            department="Engineering",
            manager_id=manager.id
        )
        session.add(employee)
        await session.commit()
        
        # Initialize Leave Balances for 2026
        for emp_id in [super_admin.id, manager.id, employee.id]:
            for leave_type, days in [("casual", 12), ("sick", 10), ("earned", 15)]:
                balance = LeaveBalance(
                    employee_id=emp_id,
                    leave_type=leave_type,
                    total_days=days,
                    year=2026
                )
                session.add(balance)
                
        await session.commit()
        print("Successfully seeded database with admin@demo.com, alice@co.com, john@co.com (password: password123)")

if __name__ == "__main__":
    asyncio.run(seed_data())
