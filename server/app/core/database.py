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
# - pool_recycle: Recycles connections older than 5 minutes to prevent stale connections on serverless DBs (like Neon DB).
# - pool_size: Base number of persistent connections (tuned for concurrent SaaS workload).
# - max_overflow: Extra connections allowed beyond pool_size during peak load.
engine = create_async_engine(
    settings.async_database_url,
    # Echo SQL queries to the terminal only in development mode for debugging
    echo=settings.ENVIRONMENT == "development",
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20,
    # Disable prepared statement caching to avoid issues with connection poolers (like PgBouncer)
    connect_args={"prepared_statement_cache_size": 0}
)

# Async session factory
# This creates a localized session for executing database queries.
# expire_on_commit=False prevents SQLAlchemy from trying to implicitly fetch data from DB after a commit,
# which is not safe or supported natively in async execution contexts.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base class for all SQLAlchemy ORM models to inherit from
# All defined models will automatically be registered onto the Base metadata
Base = declarative_base()

# Dependency to get DB session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI Dependency: Injects an asynchronous database session into each request route.
    
    This ensures that:
    1. A new database session is created specifically for the incoming request lifecycle.
    2. The session is yielded to the route handler to execute queries.
    3. The session is safely closed when the request finishes (even if an error occurs).
    """
    async with AsyncSessionLocal() as session:
        yield session
