import asyncio, os, sys
from dotenv import load_dotenv
load_dotenv('.env')

db_url = os.environ.get('DATABASE_URL').replace('postgresql://', 'postgresql+asyncpg://')

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def fetch():
    try:
        engine = create_async_engine(db_url)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT email, role FROM employees WHERE role='super_admin'"))
            rows = result.fetchall()
            for row in rows:
                print(row[0], '-', row[1])
            if not rows:
                print('NO SUPER ADMINS FOUND')
    except Exception as e:
        print('ERROR:', e)
    finally:
        await engine.dispose()

asyncio.run(fetch())
