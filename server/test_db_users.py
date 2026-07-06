import asyncio, sys
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def test():
    async with AsyncSessionLocal() as session:
        # Check platform_owners
        res = await session.execute(text("SELECT id, email, password_hash IS NOT NULL as has_pwd, role FROM platform_owners"))
        print("Platform Owners:")
        for row in res:
            print(f"  id={row.id}, email={row.email}, has_password={row.has_pwd}, role={row.role}")

        # Check employees
        res = await session.execute(text("SELECT id, email, password_hash IS NOT NULL as has_pwd, role FROM employees LIMIT 10"))
        print("Employees:")
        for row in res:
            print(f"  id={row.id}, email={row.email}, has_password={row.has_pwd}, role={row.role}")

        # Check organizations
        res = await session.execute(text("SELECT id, name FROM organizations"))
        print("Organizations:")
        for row in res:
            print(f"  id={row.id}, name={row.name}")

asyncio.run(test())
