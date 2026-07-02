import asyncio, httpx
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.modules.employees.models import Employee

async def run():
    async with AsyncSessionLocal() as session:
        emp = (await session.execute(select(Employee).where(Employee.email.isnot(None)))).scalars().first()
        if not emp: print('No emp'); return
        print('Emp:', emp.email)
        # We need a token. We can just call the backend login endpoint
        # Wait, we don't know the password. Let's just create a token.
        from app.core.security import create_access_token
        token = create_access_token(data={'sub': emp.email})
        print('Token:', token)
        async with httpx.AsyncClient() as client:
            resp = await client.get('http://127.0.0.1:8000/api/notifications', headers={'Authorization': f'Bearer {token}'})
            print(resp.status_code)
            print(resp.text)

asyncio.run(run())
