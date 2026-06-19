"""
Accrual & Carry-Forward Service
================================
Core business logic for automated leave balance management.

Monthly Accrual Flow:
    1. Check if accrual is enabled in SystemSetting
    2. For every active employee, for each accrual type (casual, sick, earned):
       - Find or create LeaveBalance for the current year
       - Credit monthly_accrual amount (capped at system max)
       - Record the mutation in AccrualLedger
    3. Log the job execution to AuditLog

Year-End Carry-Forward Flow:
    1. Check if carry-forward is enabled in SystemSetting
    2. For every active employee:
       - Earned leave: carry min(unused, max_carry_forward) into next year
       - Casual & Sick: reset to 0 (no carry-forward)
       - Maternity & Miscarriage: carry full remaining (one-time entitlements)
    3. Create new year balances with appropriate totals
    4. Record all mutations in AccrualLedger

Catch-Up Logic:
    If the server was down on the 1st and missed a month, the catch-up
    mechanism detects which months have NOT been accrued by checking the
    AccrualLedger, and retroactively credits those months.
"""

import math
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_

from app.core.database import AsyncSessionLocal
from app.modules.accrual.models import AccrualLedger
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance
from app.modules.settings.models import SystemSetting
from app.modules.audit.services import AuditLogService

logger = logging.getLogger("accrual")
logger.setLevel(logging.INFO)


class AccrualService:
    """Handles all accrual and carry-forward operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ─── Helper Methods ───────────────────────────────────────────────

    async def _get_settings(self) -> SystemSetting:
        """Fetch system settings, creating default if not exists."""
        result = await self.db.execute(select(SystemSetting))
        settings = result.scalar_one_or_none()
        if not settings:
            settings = SystemSetting()
            self.db.add(settings)
            await self.db.flush()
        return settings

    async def _get_active_employees(self) -> List[Employee]:
        """Fetch all active employees."""
        result = await self.db.execute(
            select(Employee).where(Employee.is_active == True)
        )
        return list(result.scalars().all())

    async def _get_or_create_balance(
        self, employee_id: int, leave_type: str, year: int, initial_total: int = 0
    ) -> LeaveBalance:
        """Find an existing balance or create a new one for the given year."""
        result = await self.db.execute(
            select(LeaveBalance).where(
                LeaveBalance.employee_id == employee_id,
                LeaveBalance.leave_type == leave_type,
                LeaveBalance.year == year,
            )
        )
        balance = result.scalar_one_or_none()
        if not balance:
            balance = LeaveBalance(
                employee_id=employee_id,
                leave_type=leave_type,
                total_days=initial_total,
                used_days=0,
                year=year,
            )
            self.db.add(balance)
            await self.db.flush()
        return balance

    async def _record_ledger(
        self,
        employee_id: int,
        leave_type: str,
        action_type: str,
        days_credited: float,
        balance_before: int,
        balance_after: int,
        year: int,
        month: Optional[int] = None,
    ) -> AccrualLedger:
        """Insert an immutable accrual ledger record."""
        entry = AccrualLedger(
            employee_id=employee_id,
            leave_type=leave_type,
            action_type=action_type,
            days_credited=days_credited,
            balance_before=balance_before,
            balance_after=balance_after,
            year=year,
            month=month,
        )
        self.db.add(entry)
        await self.db.flush()
        return entry

    async def _was_month_already_accrued(self, year: int, month: int) -> bool:
        """Check if monthly accrual was already run for a given year/month."""
        result = await self.db.execute(
            select(func.count(AccrualLedger.id)).where(
                AccrualLedger.action_type.in_(["monthly_accrual", "manual_trigger"]),
                AccrualLedger.year == year,
                AccrualLedger.month == month,
            )
        )
        count = result.scalar() or 0
        return count > 0

    # ─── Monthly Accrual ──────────────────────────────────────────────

    async def run_monthly_accrual(
        self, target_year: Optional[int] = None, target_month: Optional[int] = None,
        is_manual: bool = False
    ) -> Dict[str, Any]:
        """
        Credit monthly leave accruals to all active employees.

        Args:
            target_year: Override year (defaults to current year)
            target_month: Override month (defaults to current month)
            is_manual: Whether this was manually triggered by Super Admin
        """
        now = datetime.now()
        year = target_year or now.year
        month = target_month or now.month
        action_type = "manual_trigger" if is_manual else "monthly_accrual"

        settings = await self._get_settings()

        if not settings.accrual_enabled:
            msg = f"Accrual is disabled in system settings. Skipping for {year}-{month:02d}."
            logger.info(msg)
            return {"status": "skipped", "message": msg, "employees_processed": 0}

        # Prevent duplicate runs (unless manual override)
        if not is_manual:
            already_done = await self._was_month_already_accrued(year, month)
            if already_done:
                msg = f"Monthly accrual already completed for {year}-{month:02d}. Skipping."
                logger.info(msg)
                return {"status": "skipped", "message": msg, "employees_processed": 0}

        employees = await self._get_active_employees()

        # Accrual configuration: leave_type → (monthly_rate, yearly_max)
        accrual_map = {
            "casual": (settings.casual_monthly_accrual, settings.max_casual_leave),
            "sick": (settings.sick_monthly_accrual, settings.max_sick_leave),
            "earned": (settings.earned_monthly_accrual, settings.max_earned_leave),
        }

        total_credits = 0
        employees_processed = 0

        for emp in employees:
            emp_credited = False
            for leave_type, (monthly_rate, yearly_max) in accrual_map.items():
                if monthly_rate <= 0:
                    continue

                balance = await self._get_or_create_balance(emp.id, leave_type, year)
                balance_before = balance.total_days

                # Credit the accrual, but cap at yearly maximum
                new_total = min(balance.total_days + math.floor(monthly_rate), yearly_max)
                actual_credit = new_total - balance.total_days

                if actual_credit > 0:
                    balance.total_days = new_total
                    await self._record_ledger(
                        employee_id=emp.id,
                        leave_type=leave_type,
                        action_type=action_type,
                        days_credited=actual_credit,
                        balance_before=balance_before,
                        balance_after=new_total,
                        year=year,
                        month=month,
                    )
                    total_credits += actual_credit
                    emp_credited = True

            if emp_credited:
                employees_processed += 1

        # Audit log the job execution
        await AuditLogService.log_action(
            db=self.db,
            actor_id=None,
            action=f"accrual_{action_type}",
            target_type="system",
            target_id=None,
            details={
                "year": year,
                "month": month,
                "employees_processed": employees_processed,
                "total_days_credited": total_credits,
                "is_manual": is_manual,
            },
        )

        await self.db.commit()

        msg = (
            f"Monthly accrual completed for {year}-{month:02d}: "
            f"{employees_processed} employees, {total_credits} total days credited."
        )
        logger.info(msg)
        return {
            "status": "completed",
            "message": msg,
            "year": year,
            "month": month,
            "employees_processed": employees_processed,
            "total_days_credited": total_credits,
        }

    # ─── Year-End Carry-Forward ───────────────────────────────────────

    async def run_year_end_carry_forward(
        self, from_year: Optional[int] = None, is_manual: bool = False
    ) -> Dict[str, Any]:
        """
        Process year-end carry-forward for all active employees.

        - Earned leave: carry min(unused, max_carry_forward) into next year
        - Casual & Sick: reset to 0 (fresh allocation starts via monthly accrual)
        - Maternity & Miscarriage: carry full remaining

        Args:
            from_year: The year to carry forward FROM (defaults to previous year)
            is_manual: Whether this was manually triggered by Super Admin
        """
        now = datetime.now()
        prev_year = from_year or (now.year - 1)
        new_year = prev_year + 1
        action_type = "manual_trigger" if is_manual else "carry_forward"

        settings = await self._get_settings()

        if not settings.carry_forward_enabled:
            msg = f"Carry-forward is disabled in system settings. Skipping {prev_year} → {new_year}."
            logger.info(msg)
            return {"status": "skipped", "message": msg, "employees_processed": 0}

        # Check if carry-forward already ran for this transition
        if not is_manual:
            result = await self.db.execute(
                select(func.count(AccrualLedger.id)).where(
                    AccrualLedger.action_type == "carry_forward",
                    AccrualLedger.year == new_year,
                    AccrualLedger.month == None,
                )
            )
            if (result.scalar() or 0) > 0:
                msg = f"Carry-forward already completed for {prev_year} → {new_year}. Skipping."
                logger.info(msg)
                return {"status": "skipped", "message": msg, "employees_processed": 0}

        employees = await self._get_active_employees()
        employees_processed = 0
        total_carried = 0

        for emp in employees:
            emp_processed = False

            # Get all balances from previous year
            result = await self.db.execute(
                select(LeaveBalance).where(
                    LeaveBalance.employee_id == emp.id,
                    LeaveBalance.year == prev_year,
                )
            )
            old_balances = {b.leave_type: b for b in result.scalars().all()}

            # ── Earned Leave: Carry forward with cap ──
            if "earned" in old_balances:
                old_bal = old_balances["earned"]
                unused = max(old_bal.total_days - old_bal.used_days, 0)
                carry_amount = min(unused, settings.earned_leave_max_carry_forward)

                new_balance = await self._get_or_create_balance(emp.id, "earned", new_year)
                balance_before = new_balance.total_days
                new_balance.total_days += carry_amount

                if carry_amount > 0:
                    await self._record_ledger(
                        employee_id=emp.id,
                        leave_type="earned",
                        action_type=action_type,
                        days_credited=carry_amount,
                        balance_before=balance_before,
                        balance_after=new_balance.total_days,
                        year=new_year,
                    )
                    total_carried += carry_amount
                    emp_processed = True

            # ── Casual & Sick: Reset (create new year balance at 0, accrual will fill it) ──
            for ltype in ["casual", "sick"]:
                new_balance = await self._get_or_create_balance(emp.id, ltype, new_year, initial_total=0)
                if ltype in old_balances:
                    old_bal = old_balances[ltype]
                    unused = max(old_bal.total_days - old_bal.used_days, 0)
                    if unused > 0:
                        await self._record_ledger(
                            employee_id=emp.id,
                            leave_type=ltype,
                            action_type="year_reset",
                            days_credited=0,
                            balance_before=unused,
                            balance_after=0,
                            year=new_year,
                        )
                        emp_processed = True

            # ── Maternity & Miscarriage: Carry full remaining ──
            for ltype in ["maternity", "miscarriage"]:
                if ltype in old_balances:
                    old_bal = old_balances[ltype]
                    unused = max(old_bal.total_days - old_bal.used_days, 0)

                    new_balance = await self._get_or_create_balance(emp.id, ltype, new_year)
                    balance_before = new_balance.total_days
                    new_balance.total_days = unused  # Full carry

                    if unused > 0:
                        await self._record_ledger(
                            employee_id=emp.id,
                            leave_type=ltype,
                            action_type=action_type,
                            days_credited=unused,
                            balance_before=balance_before,
                            balance_after=unused,
                            year=new_year,
                        )
                        total_carried += unused
                        emp_processed = True

            if emp_processed:
                employees_processed += 1

        # Audit log
        await AuditLogService.log_action(
            db=self.db,
            actor_id=None,
            action=f"accrual_{action_type}",
            target_type="system",
            target_id=None,
            details={
                "from_year": prev_year,
                "to_year": new_year,
                "employees_processed": employees_processed,
                "total_days_carried": total_carried,
                "is_manual": is_manual,
            },
        )

        await self.db.commit()

        msg = (
            f"Year-end carry-forward completed ({prev_year} → {new_year}): "
            f"{employees_processed} employees, {total_carried} total days carried."
        )
        logger.info(msg)
        return {
            "status": "completed",
            "message": msg,
            "from_year": prev_year,
            "to_year": new_year,
            "employees_processed": employees_processed,
            "total_days_carried": total_carried,
        }

    # ─── Catch-Up (Retroactive Accrual for Missed Months) ────────────

    async def run_catch_up(self) -> Dict[str, Any]:
        """
        Detect and retroactively credit any missed monthly accruals
        for the current year. Useful when the server was down on the 1st.
        """
        now = datetime.now()
        current_year = now.year
        current_month = now.month
        results = []

        for month in range(1, current_month + 1):
            already_done = await self._was_month_already_accrued(current_year, month)
            if not already_done:
                logger.info(f"Catch-up: Running missed accrual for {current_year}-{month:02d}")
                result = await self.run_monthly_accrual(
                    target_year=current_year,
                    target_month=month,
                    is_manual=False,
                )
                results.append(result)

        if not results:
            return {
                "status": "up_to_date",
                "message": f"All months up to {current_year}-{current_month:02d} already accrued.",
                "months_caught_up": 0,
            }

        return {
            "status": "completed",
            "message": f"Caught up {len(results)} missed month(s).",
            "months_caught_up": len(results),
            "details": results,
        }

    # ─── Accrual History Query ────────────────────────────────────────

    async def get_accrual_history(
        self,
        employee_id: Optional[int] = None,
        leave_type: Optional[str] = None,
        year: Optional[int] = None,
        action_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """Query accrual ledger with filters and pagination."""
        query = select(AccrualLedger)

        if employee_id:
            query = query.where(AccrualLedger.employee_id == employee_id)
        if leave_type:
            query = query.where(AccrualLedger.leave_type == leave_type)
        if year:
            query = query.where(AccrualLedger.year == year)
        if action_type:
            query = query.where(AccrualLedger.action_type == action_type)

        # Total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Paginated results
        query = query.order_by(AccrualLedger.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        entries = result.scalars().all()

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "entries": [
                {
                    "id": e.id,
                    "employee_id": e.employee_id,
                    "leave_type": e.leave_type,
                    "action_type": e.action_type,
                    "days_credited": e.days_credited,
                    "balance_before": e.balance_before,
                    "balance_after": e.balance_after,
                    "year": e.year,
                    "month": e.month,
                    "created_at": e.created_at.isoformat() if e.created_at else None,
                }
                for e in entries
            ],
        }


# ─── Standalone Job Runners (called by APScheduler) ──────────────────

async def job_monthly_accrual():
    """Standalone async function invoked by the scheduler cron trigger."""
    logger.info("⏰ Cron triggered: Monthly Accrual Job starting...")
    async with AsyncSessionLocal() as db:
        service = AccrualService(db)
        result = await service.run_monthly_accrual()
        logger.info(f"✅ Monthly Accrual Job result: {result}")


async def job_year_end_carry_forward():
    """Standalone async function invoked by the scheduler cron trigger."""
    logger.info("⏰ Cron triggered: Year-End Carry-Forward Job starting...")
    async with AsyncSessionLocal() as db:
        service = AccrualService(db)
        result = await service.run_year_end_carry_forward()
        logger.info(f"✅ Year-End Carry-Forward Job result: {result}")


async def job_catch_up():
    """Standalone async function invoked on server startup to catch up missed months."""
    logger.info("🔄 Startup: Running catch-up check for missed accruals...")
    async with AsyncSessionLocal() as db:
        service = AccrualService(db)
        result = await service.run_catch_up()
        logger.info(f"🔄 Catch-up result: {result}")
