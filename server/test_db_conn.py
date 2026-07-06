import asyncio, sys
from app.core.config import settings
from app.core.database import engine
import sqlalchemy

async def test():
    print(f"ENV: {settings.ENVIRONMENT}", flush=True)
    print(f"DB URL: {settings.DATABASE_URL[:50]}...", flush=True)
    try:
        async with engine.connect() as conn:
            result = await conn.execute(sqlalchemy.text("SELECT 1"))
            print(f"DB connected: {result.scalar()}", flush=True)
    except Exception as e:
        print(f"FAIL: {type(e).__name__}: {e}", flush=True)
    finally:
        await engine.dispose()

asyncio.run(test())
