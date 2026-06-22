"""
Approve a pending onboarding application and provision the tenant.

Usage:
    cd server/
    python scripts/approve_tenant.py <email>
"""
import asyncio
import sys
import os
from datetime import datetime

# Add server directory to sys.path
server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, server_dir)

# Load .env before importing app modules
from dotenv import load_dotenv
env_path = os.path.join(server_dir, '..', '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
env_path_server = os.path.join(server_dir, '.env')
if os.path.exists(env_path_server):
    load_dotenv(env_path_server, override=True)

from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal, engine
from app.core.security import pwd_context
from app.modules.organizations.models import Organization, OnboardingApplication
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance


async def approve_tenant(email: str) -> None:
    """Approve a pending application and create the organization + super admin."""
    try:
        async with AsyncSessionLocal() as db:
            # 1. Find the application
            result = await db.execute(
                select(OnboardingApplication).where(OnboardingApplication.admin_email == email)
            )
            application = result.scalar_one_or_none()

            if not application:
                print(f"Error: No onboarding application found for email '{email}'.")
                return

            if application.status == "approved":
                print(f"Error: Application for '{email}' is already approved.")
                return

            # 2. Update application status
            application.status = "approved"

            # 3. Create Organization
            domain = email.split('@')[1] if '@' in email else "unknown.com"
            org = Organization(
                name=application.company_name,
                domain=domain,
                plan_type="enterprise",
                is_active=True
            )
            db.add(org)
            await db.flush()  # flush to get org.id

            # 4. Create Employee (super_admin)
            admin_employee = Employee(
                organization_id=org.id,
                name="Admin User",
                email=email,
                password_hash=application.admin_password_hash or pwd_context.hash("Welcome123!"),
                role="super_admin",
                department="Management",
                gender="not_specified",
                is_active=True
            )
            db.add(admin_employee)
            await db.flush()  # flush to get admin_employee.id

            # 5. Add default leave balances
            current_year = datetime.today().year
            default_balances = [
                ("casual", 12),
                ("sick", 12),
                ("earned", 18),
                ("maternity", 182),
                ("miscarriage", 42),
            ]
            for leave_type, days in default_balances:
                balance = LeaveBalance(
                    organization_id=org.id,
                    employee_id=admin_employee.id,
                    leave_type=leave_type,
                    total_days=days,
                    used_days=0,
                    year=current_year
                )
                db.add(balance)

            await db.commit()
            print(f"Success! Tenant approved for '{email}'.")
            print(f"  Organization: '{org.name}' (id={org.id})")
            print(f"  Super Admin:  '{email}' (id={admin_employee.id})")
            print(f"  Leave balances created for year {current_year}.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/approve_tenant.py <email>")
        sys.exit(1)

    email_arg = sys.argv[1]
    asyncio.run(approve_tenant(email_arg))