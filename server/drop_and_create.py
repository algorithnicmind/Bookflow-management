import asyncio
import os
import sys

# Add the server directory to the sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base

# Import all models
from app.modules.organizations.models import Organization, OnboardingApplication
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.modules.settings.models import SystemSetting, PublicHoliday, ApprovalChain, ApprovalStep, LeavePolicy, AccrualLog
from app.modules.notifications.models import Notification
from app.modules.audit.models import AuditLog
from app.modules.contact.models import ContactMessage
from app.modules.accrual.models import AccrualLedger

async def reset_db():
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database reset complete.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_db())
