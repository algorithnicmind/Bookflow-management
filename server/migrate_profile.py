import asyncio
from sqlalchemy import text
from app.core.database import engine

async def migrate():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE employees ADD COLUMN location VARCHAR(255);"))
        except Exception as e:
            print("location error:", e)
        try:
            await conn.execute(text("ALTER TABLE employees ADD COLUMN date_of_birth DATE;"))
        except Exception as e:
            print("date_of_birth error:", e)
        try:
            await conn.execute(text("ALTER TABLE employees ADD COLUMN phone_number VARCHAR(50);"))
        except Exception as e:
            print("phone_number error:", e)
    print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
