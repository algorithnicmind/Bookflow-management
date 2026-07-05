"""
Health Check API Routes
-----------------------
Provides a comprehensive health check endpoint for monitoring and load balancer probes.
Verifies database connectivity, scheduler status, and reports system uptime.
"""
import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(prefix="/api/health", tags=["health"])

# Track application start time for uptime reporting
_start_time = time.time()


@router.get("")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Comprehensive health check endpoint.
    
    Checks:
    - Database connectivity (executes SELECT 1)
    - APScheduler running status
    - Application uptime
    
    Returns:
    - status: "healthy" | "degraded" | "unhealthy"
    - Individual component statuses
    - Timestamp in ISO format
    """
    # --- Database check ---
    db_ok = False
    db_latency_ms = None
    try:
        start = time.time()
        await db.execute(text("SELECT 1"))
        db_latency_ms = round((time.time() - start) * 1000, 1)
        db_ok = True
    except Exception:
        pass

    # --- Scheduler check ---
    scheduler_ok = False
    try:
        from app.modules.leaves.cron import scheduler
        scheduler_ok = scheduler.running
    except Exception:
        pass

    # --- Determine overall status ---
    if db_ok and scheduler_ok:
        status = "healthy"
    elif db_ok:
        status = "degraded"  # DB works but scheduler is down
    else:
        status = "unhealthy"

    uptime_seconds = round(time.time() - _start_time)

    return {
        "status": status,
        "database": {
            "connected": db_ok,
            "latency_ms": db_latency_ms,
        },
        "scheduler": {
            "running": scheduler_ok,
        },
        "uptime_seconds": uptime_seconds,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0",
    }
