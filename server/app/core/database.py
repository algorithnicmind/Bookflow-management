"""
Database Core
-------------
This module handles the core database connections for LeaveFlow using SQLAlchemy.
It is built on an entirely async architecture (`asyncpg`) to support high concurrency
and non-blocking I/O, which is critical for a high-traffic SaaS platform.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Create async SQLAlchemy engine
# - pool_pre_ping: Tests connections before using them to prevent "MySQL/Postgres has gone away" errors.
# - pool_recycle: Recycles connections older than 5 minutes to prevent stale connections on Neon DB serverless.
engine = create_async_engine(
    settings.async_database_url,
    echo=settings.ENVIRONMENT == "development",
    pool_pre_ping=True,
    pool_recycle=300
)

# Async session factory
# expire_on_commit=False prevents SQLAlchemy from trying to hit the DB after a commit to refresh attributes,
# which is not safe in async contexts.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base class for all ORM models to inherit from
Base = declarative_base()

# Dependency to get DB session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI Dependency: Injects a database session into each request route.
    
    This ensures that:
    1. A new database session is created specifically for the incoming request.
    2. The session is yielded to the route handler.
    3. The session is safely closed when the request finishes (even if an error occurs).
    """
    async with AsyncSessionLocal() as session:
        yield session
