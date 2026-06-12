"""
Database utilities for test state verification and cleanup.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func


async def count_rows(db: AsyncSession, model) -> int:
    """Count total rows of a given model."""
    result = await db.execute(select(func.count()).select_from(model))
    return result.scalar()


async def get_all(db: AsyncSession, model) -> list:
    """Get all rows of a given model."""
    result = await db.execute(select(model))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, model, record_id: int):
    """Get a single record by ID."""
    result = await db.execute(select(model).where(model.id == record_id))
    return result.scalar_one_or_none()
