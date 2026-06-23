import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.modules.organizations.models import Organization
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance
from app.core.security import pwd_context
from datetime import datetime

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Find Sahoo and Sons
        result = await db.execute(select(Organization).where(Organization.name.ilike('%Sahoo%')))
        org = result.scalar_one_or_none()
        
        if not org:
            print("Error: Organization not found.")
            return

        print(f"Found Organization: {org.name} (ID: {org.id})")
        
        password_hash = pwd_context.hash("password123")
        current_year = datetime.today().year
        
        default_balances = [
            ("casual", 12),
            ("sick", 12),
            ("earned", 18),
        ]

        async def create_emp(name, email, role, dept, manager_id=None):
            emp = Employee(
                organization_id=org.id,
                name=name,
                email=email,
                password_hash=password_hash,
                role=role,
                department=dept,
                manager_id=manager_id,
                gender="not_specified",
                is_active=True
            )
            db.add(emp)
            await db.flush() # to get ID
            
            for l_type, days in default_balances:
                bal = LeaveBalance(
                    organization_id=org.id,
                    employee_id=emp.id,
                    leave_type=l_type,
                    total_days=days,
                    used_days=0,
                    year=current_year,
                )
                db.add(bal)
            return emp

        # Create Admins
        print("Creating Admins...")
        await create_emp("Admin One", "admin1@sahoosons.com", "admin", "Management")
        await create_emp("Admin Two", "admin2@sahoosons.com", "admin", "Management")

        departments = ["Engineering", "Sales"]
        
        for i, dept in enumerate(departments):
            print(f"Creating Manager and Employees for {dept}...")
            manager = await create_emp(f"{dept} Manager", f"manager.{dept.lower()}@sahoosons.com", "manager", dept)
            
            # Create 2 employees for this manager
            await create_emp(f"{dept} Emp 1", f"emp1.{dept.lower()}@sahoosons.com", "employee", dept, manager.id)
            await create_emp(f"{dept} Emp 2", f"emp2.{dept.lower()}@sahoosons.com", "employee", dept, manager.id)

        await db.commit()
        print("Seeding completed successfully! All users have password: password123")

if __name__ == "__main__":
    asyncio.run(seed_data())
