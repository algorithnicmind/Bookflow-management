import asyncio
import os
import sys

# Ensure server module is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from app.modules.organizations.models import Organization, OnboardingApplication
from app.modules.employees.models import Employee, PlatformOwner
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.core.security import pwd_context

async def check_and_seed_owner():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(PlatformOwner))
        owners = result.scalars().all()
        if not owners:
            print("No platform owners found. Seeding default owner.")
            hashed_password = pwd_context.hash("Owner@123!")
            owner = PlatformOwner(
                name="Platform Owner",
                email="owner@leaveflow.com",
                password_hash=hashed_password,
                role="platform_owner",
                department="System",
                is_active=True
            )
            db.add(owner)
            await db.commit()
            print("Default Platform Owner created: owner@leaveflow.com / Owner@123!")
        else:
            print(f"Platform Owners exist: {[o.email for o in owners]}")

if __name__ == "__main__":
    asyncio.run(check_and_seed_owner())
