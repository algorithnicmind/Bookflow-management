"""
Accrual API Routes
==================
Super Admin endpoints for managing the automated accrual system:

  GET  /api/accrual/history   → View accrual ledger with filters
  GET  /api/accrual/status    → Check scheduler status & next run times
  POST /api/accrual/trigger   → Manually trigger accrual or carry-forward
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import RoleChecker
from app.modules.employees.models import Employee
from app.modules.accrual.services import AccrualService
from app.modules.accrual.scheduler import get_scheduler_status

router = APIRouter(prefix="/api/accrual", tags=["accrual"])


@router.get("/history")
async def get_accrual_history(
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    leave_type: Optional[str] = Query(None, description="Filter by leave type"),
    year: Optional[int] = Query(None, description="Filter by year"),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    limit: int = Query(50, ge=1, le=200, description="Results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin"])),
):
    """
    View the accrual ledger — a complete audit trail of every automated
    leave balance mutation (monthly accruals, carry-forwards, resets).
    """
    service = AccrualService(db)
    return await service.get_accrual_history(
        employee_id=employee_id,
        leave_type=leave_type,
        year=year,
        action_type=action_type,
        limit=limit,
        offset=offset,
    )


@router.get("/status")
async def get_scheduler_info(
    current_user: Employee = Depends(RoleChecker(["super_admin"])),
):
    """
    Check the current status of the accrual scheduler and
    next scheduled run times for all cron jobs.
    """
    return get_scheduler_status()


@router.post("/trigger")
async def trigger_accrual(
    job_type: str = Query(
        ...,
        description="Which job to run: 'monthly_accrual', 'carry_forward', or 'catch_up'"
    ),
    year: Optional[int] = Query(None, description="Target year (for monthly: accrual year, for carry-forward: FROM year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Target month (only for monthly_accrual)"),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin"])),
):
    """
    Manually trigger an accrual job. Useful for:
      - Testing the accrual logic
      - Catching up missed months
      - Running year-end carry-forward outside the scheduled window

    job_type must be one of:
      - 'monthly_accrual': Credit monthly leaves for a specific month
      - 'carry_forward': Run year-end carry-forward from a specific year
      - 'catch_up': Auto-detect and credit all missed months this year
    """
    service = AccrualService(db)

    if job_type == "monthly_accrual":
        return await service.run_monthly_accrual(
            target_year=year,
            target_month=month,
            is_manual=True,
        )
    elif job_type == "carry_forward":
        return await service.run_year_end_carry_forward(
            from_year=year,
            is_manual=True,
        )
    elif job_type == "catch_up":
        return await service.run_catch_up()
    else:
        return {
            "status": "error",
            "message": f"Unknown job_type: '{job_type}'. Use 'monthly_accrual', 'carry_forward', or 'catch_up'.",
        }
