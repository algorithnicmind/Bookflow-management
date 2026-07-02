import asyncio
from app.core.database import AsyncSessionLocal
from app.modules.employees.models import Employee
from app.modules.organizations.models import Organization
from app.modules.leaves.models import LeaveRequest
from sqlalchemy.future import select

async def get_leaves():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(LeaveRequest).order_by(LeaveRequest.id.desc()).limit(5))
        leaves = result.scalars().all()
        for l in leaves:
            print(f'Leave ID: {l.id}, Type: {l.leave_type}, Status: {l.status}, Start: {l.start_date}, End: {l.end_date}, Reason: {l.reason}')
        if not leaves:
            print('No leaves found.')

if __name__ == '__main__':
    asyncio.run(get_leaves())
