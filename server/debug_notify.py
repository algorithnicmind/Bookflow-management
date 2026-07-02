import asyncio, httpx
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.modules.employees.models import Employee

async def test():
    async with AsyncSessionLocal() as session:
        emp = (await session.execute(select(Employee).where(Employee.email.isnot(None)))).scalars().first()
        if not emp: print('No employee'); return

        print(f'Found employee: {emp.email}')

try:
    asyncio.run(test())
except Exception as e:
    print(e)
