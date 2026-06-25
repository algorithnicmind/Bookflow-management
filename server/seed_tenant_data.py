import asyncio
import socket

original_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.modules.organizations.models import Organization, OnboardingApplication
from app.modules.employees.models import Employee, PlatformOwner
from app.modules.leaves.models import LeaveRequest, LeaveApproval, LeaveBalance
from app.core.security import pwd_context

async def seed_data():
    async with AsyncSessionLocal() as session:
        # Find organization "Design Studio X"
        result = await session.execute(select(Organization).where(Organization.name == "Design Studio X"))
        org = result.scalar_one_or_none()
        
        if not org:
            print("Organization 'Design Studio X' not found.")
            return
            
        print(f"Found organization: {org.name} (ID: {org.id})")
        
        # Check if admin already exists
        res = await session.execute(select(Employee).where(
            (Employee.organization_id == org.id) & 
            (Employee.role == 'super_admin')
        ))
        admin = res.scalar_one_or_none()
        
        if not admin:
            admin = Employee(
                organization_id=org.id,
                name="Alex Admin",
                email="admin@designstudiox.com",
                password_hash=pwd_context.hash("Password123!"),
                role="super_admin",
                department="General",
                gender="male",
                is_active=True
            )
            session.add(admin)
            await session.commit()
            await session.refresh(admin)
            print(f"Created Admin: {admin.email}")
        else:
            print(f"Admin already exists: {admin.email}")
            
        departments = ["Engineering", "Marketing", "HR", "Finance"]
        
        for dept in departments:
            # Create Manager
            manager_email = f"manager.{dept.lower()}@designstudiox.com"
            res = await session.execute(select(Employee).where(Employee.email == manager_email))
            manager = res.scalar_one_or_none()
            
            if not manager:
                manager = Employee(
                    organization_id=org.id,
                    name=f"Mark {dept} Manager",
                    email=manager_email,
                    password_hash=pwd_context.hash("Password123!"),
                    role="manager",
                    department=dept,
                    gender="male",
                    is_active=True
                )
                session.add(manager)
                await session.commit()
                await session.refresh(manager)
                print(f"Created Manager: {manager.email}")
            
            # Create Employee
            emp_email = f"employee.{dept.lower()}@designstudiox.com"
            res = await session.execute(select(Employee).where(Employee.email == emp_email))
            employee = res.scalar_one_or_none()
            
            if not employee:
                employee = Employee(
                    organization_id=org.id,
                    name=f"Emma {dept} Employee",
                    email=emp_email,
                    password_hash=pwd_context.hash("Password123!"),
                    role="employee",
                    department=dept,
                    manager_id=manager.id,
                    gender="female",
                    is_active=True
                )
                session.add(employee)
                await session.commit()
                print(f"Created Employee: {employee.email}")

if __name__ == "__main__":
    asyncio.run(seed_data())
