"""
APScheduler Configuration
=========================
Sets up background cron jobs for automated leave management:

  1. Monthly Accrual  → Runs 1st of every month at 00:05 UTC
  2. Year-End C/F     → Runs January 1st at 00:30 UTC
  3. Startup Catch-Up → Runs once on server boot to credit missed months

Uses AsyncIOScheduler which integrates natively with FastAPI's event loop.
All job functions open their own DB sessions — no shared state.
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.modules.accrual.services import (
    job_monthly_accrual,
    job_year_end_carry_forward,
    job_catch_up,
)

logger = logging.getLogger("accrual.scheduler")
logger.setLevel(logging.INFO)

# Module-level scheduler instance
_scheduler: AsyncIOScheduler | None = None


def start_scheduler() -> AsyncIOScheduler:
    """
    Initialize and start the APScheduler with all accrual cron jobs.
    Called from FastAPI lifespan on startup.
    """
    global _scheduler

    _scheduler = AsyncIOScheduler(
        job_defaults={
            "coalesce": True,          # If multiple missed fires, run only once
            "max_instances": 1,        # Prevent concurrent execution of same job
            "misfire_grace_time": 3600, # Allow up to 1 hour late execution
        }
    )

    # ── Job 1: Monthly Leave Accrual ──────────────────────────────
    # Runs at 00:05 on the 1st of every month
    _scheduler.add_job(
        job_monthly_accrual,
        trigger=CronTrigger(day=1, hour=0, minute=5),
        id="monthly_accrual",
        name="Monthly Leave Accrual",
        replace_existing=True,
    )

    # ── Job 2: Year-End Carry-Forward ─────────────────────────────
    # Runs at 00:30 on January 1st every year
    _scheduler.add_job(
        job_year_end_carry_forward,
        trigger=CronTrigger(month=1, day=1, hour=0, minute=30),
        id="year_end_carry_forward",
        name="Year-End Leave Carry-Forward",
        replace_existing=True,
    )

    # ── Job 3: Startup Catch-Up (one-time) ────────────────────────
    # Runs 10 seconds after scheduler starts to catch missed months
    _scheduler.add_job(
        job_catch_up,
        trigger="date",  # One-shot trigger
        id="startup_catch_up",
        name="Startup Catch-Up for Missed Accruals",
        replace_existing=True,
    )

    _scheduler.start()
    logger.info("=" * 60)
    logger.info("🚀 ACCRUAL SCHEDULER STARTED")
    logger.info("   📅 Monthly Accrual  : 1st of every month @ 00:05 UTC")
    logger.info("   🗓️  Year-End C/F     : January 1st @ 00:30 UTC")
    logger.info("   🔄 Startup Catch-Up : Running now...")
    logger.info("=" * 60)

    return _scheduler


def stop_scheduler():
    """
    Gracefully shut down the scheduler.
    Called from FastAPI lifespan on shutdown.
    """
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("🛑 Accrual scheduler stopped.")
        _scheduler = None


def get_scheduler_status() -> dict:
    """Return current scheduler state and next run times for all jobs."""
    if not _scheduler or not _scheduler.running:
        return {"running": False, "jobs": []}

    jobs = []
    for job in _scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger),
        })

    return {"running": True, "jobs": jobs}
