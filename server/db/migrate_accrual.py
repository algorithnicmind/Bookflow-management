"""
Migration script: Add accrual & carry-forward columns to system_settings table.
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import text
from app.core.database import engine

MIGRATION_QUERIES = [
    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS accrual_enabled BOOLEAN NOT NULL DEFAULT TRUE",
    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS casual_monthly_accrual DOUBLE PRECISION NOT NULL DEFAULT 1.0",
    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS sick_monthly_accrual DOUBLE PRECISION NOT NULL DEFAULT 1.0",
    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS earned_monthly_accrual DOUBLE PRECISION NOT NULL DEFAULT 1.5",
    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS carry_forward_enabled BOOLEAN NOT NULL DEFAULT TRUE",
    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS earned_leave_max_carry_forward INTEGER NOT NULL DEFAULT 30",
]

async def run_migration():
    print("[MIGRATION] Running database migration for accrual columns...")
    async with engine.begin() as conn:
        for query in MIGRATION_QUERIES:
            await conn.execute(text(query))
            col_name = query.split("ADD COLUMN IF NOT EXISTS ")[1].split(" ")[0]
            print(f"  [OK] Column '{col_name}' ensured")

    print("[DONE] Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_migration())
