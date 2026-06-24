import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.future import select
from datetime import datetime

# Add the server directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../server')))

from app.core.database import Base
from app.core.security import pwd_context
from app.core.config import settings

from app.modules.organizations.models import Organization
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveBalance, LeaveApproval
from app.modules.settings.models import SystemSetting, LeavePolicy, ApprovalChain, ApprovalStep
from app.modules.onboarding.models import PlatformOwner


async def seed_database():
    """
    Seeds the database with an industrial-grade demo scenario.
    """
    print("Connecting to database...")
    engine = create_async_engine(settings.async_database_url, echo=False)
    SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    print("Creating tables (if not exist)...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # 1. Platform Owner
        owner_email = "owner@leaveflow.com"
        owner_res = await db.execute(select(PlatformOwner).where(PlatformOwner.email == owner_email))
        if not owner_res.scalar_one_or_none():
            print("Creating Platform Owner...")
            db.add(PlatformOwner(email=owner_email, password_hash=pwd_context.hash("password123")))

        # 2. Organization
        org_name = "Global Tech Corp"
        org_res = await db.execute(select(Organization).where(Organization.name == org_name))
        org = org_res.scalar_one_or_none()
        if not org:
            print("Creating Organization...")
            org = Organization(
                name=org_name,
                domain="globaltech.leaveflow.com",
                plan_type="enterprise",
                is_active=True
            )
            db.add(org)
            await db.flush()

        # 3. Employees
        print("Creating Employees...")
        emp_data = [
            {"name": "Alice SuperAdmin", "email": "alice@globaltech.com", "role": "super_admin", "dept": None},
            {"name": "Bob Admin", "email": "bob@globaltech.com", "role": "admin", "dept": "HR"},
            {"name": "Charlie Manager", "email": "charlie@globaltech.com", "role": "manager", "dept": "Engineering"},
            {"name": "Dave Employee", "email": "dave@globaltech.com", "role": "employee", "dept": "Engineering"},
            {"name": "Eve Employee", "email": "eve@globaltech.com", "role": "employee", "dept": "Engineering"}
        ]
        
        employees = {}
        for ed in emp_data:
            res = await db.execute(select(Employee).where(Employee.email == ed["email"]))
            emp = res.scalar_one_or_none()
            if not emp:
                emp = Employee(
                    organization_id=org.id,
                    name=ed["name"],
                    email=ed["email"],
                    password_hash=pwd_context.hash("password123"),
                    role=ed["role"],
                    department=ed["dept"],
                    is_active=True
                )
                db.add(emp)
                await db.flush()
            employees[ed["name"]] = emp

        # Wire up manager
        employees["Dave Employee"].manager_id = employees["Charlie Manager"].id
        employees["Eve Employee"].manager_id = employees["Charlie Manager"].id
        
        # 4. Leave Policies
        print("Creating Policies...")
        policies = [
            {"type": "casual", "days": 12},
            {"type": "sick", "days": 12},
            {"type": "earned", "days": 18}
        ]
        
        for pd in policies:
            res = await db.execute(select(LeavePolicy).where(
                LeavePolicy.organization_id == org.id,
                LeavePolicy.leave_type == pd["type"]
            ))
            if not res.scalar_one_or_none():
                db.add(LeavePolicy(
                    organization_id=org.id,
                    leave_type=pd["type"],
                    base_days=pd["days"],
                    accrual_rate=pd["days"]/12.0,
                    max_carry_forward=10,
                    requires_document=(pd["type"] == "sick")
                ))

        # 5. Leave Balances
        print("Provisioning Balances...")
        current_year = datetime.now().year
        for emp in employees.values():
            for pd in policies:
                res = await db.execute(select(LeaveBalance).where(
                    LeaveBalance.employee_id == emp.id,
                    LeaveBalance.leave_type == pd["type"],
                    LeaveBalance.year == current_year
                ))
                if not res.scalar_one_or_none():
                    db.add(LeaveBalance(
                        organization_id=org.id,
                        employee_id=emp.id,
                        leave_type=pd["type"],
                        year=current_year,
                        total_days=pd["days"],
                        used_days=0
                    ))

        # 6. Approval Chain
        print("Setting up Approval Chains...")
        res = await db.execute(select(ApprovalChain).where(
            ApprovalChain.organization_id == org.id,
            ApprovalChain.department == "Engineering"
        ))
        chain = res.scalar_one_or_none()
        if not chain:
            chain = ApprovalChain(
                organization_id=org.id,
                department="Engineering",
                description="Engineering Leave Approvals"
            )
            db.add(chain)
            await db.flush()
            
            db.add(ApprovalStep(chain_id=chain.id, step_order=1, required_role="manager"))
            db.add(ApprovalStep(chain_id=chain.id, step_order=2, required_role="admin"))

        await db.commit()
        print("Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
