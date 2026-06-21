import asyncio
import asyncpg
import os

async def migrate():
    # Parse from environment or use default
    url = os.environ.get("DATABASE_URL", "postgresql://postgres:admin@localhost/leave_management")
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql://")
        
    conn = await asyncpg.connect(url)
    try:
        await conn.execute("ALTER TABLE employees ADD COLUMN clerk_id VARCHAR(255) UNIQUE;")
        print("Added clerk_id column.")
    except Exception as e:
        print(f"Error adding clerk_id: {e}")
        
    try:
        await conn.execute("ALTER TABLE employees ALTER COLUMN password_hash DROP NOT NULL;")
        print("Made password_hash nullable.")
    except Exception as e:
        print(f"Error altering password_hash: {e}")
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate())
