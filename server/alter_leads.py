import asyncio
import os
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def alter_table():
    async with AsyncSessionLocal() as session:
        try:
            # Add admin_name
            await session.execute(text("ALTER TABLE onboarding_applications ADD COLUMN admin_name VARCHAR(100);"))
            print("Successfully added admin_name column.")
        except Exception as e:
            print(f"admin_name column might already exist: {e}")
            
        try:
            # Add industry
            await session.execute(text("ALTER TABLE onboarding_applications ADD COLUMN industry VARCHAR(100);"))
            print("Successfully added industry column.")
        except Exception as e:
            print(f"industry column might already exist: {e}")

        await session.commit()
        print("Database alterations completed.")

if __name__ == "__main__":
    asyncio.run(alter_table())
