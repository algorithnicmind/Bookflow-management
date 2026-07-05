import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.future import select
from sqlalchemy import text
from datetime import datetime
from app.core.database import AsyncSessionLocal
from app.modules.settings.models import LeavePolicy
from app.modules.leaves.models import LeaveBalance
from app.modules.employees.models import Employee

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def run_monthly_accruals():
    """Runs monthly to add earned leave days based on policy accrual rates."""
    logger.info("Starting monthly accruals job...")
    async with AsyncSessionLocal() as db:
        current_year = datetime.now().year
        
        # Bulk UPDATE using PostgreSQL FROM clause for joining tables
        await db.execute(text("""
            UPDATE leave_balances lb
            SET total_days = lb.total_days + lp.accrual_rate
            FROM employees e
            JOIN leave_policy lp ON e.organization_id = lp.organization_id
                AND (lp.department IS NULL OR lp.department = e.department)
                AND (lp.role IS NULL OR lp.role = e.role)
            WHERE lb.employee_id = e.id
              AND lb.leave_type = lp.leave_type
              AND lb.year = :year
              AND lp.accrual_rate > 0
              AND e.is_active = true
        """), {"year": current_year})
                        
        from app.modules.settings.models import AccrualLog
        log = AccrualLog(job_type="monthly_accrual", status="success", details="Processed monthly accruals")
        db.add(log)
        await db.commit()
    logger.info("Finished monthly accruals job.")

async def run_yearly_carry_forward():
    """Runs yearly on Jan 1st to carry forward balances."""
    logger.info("Starting yearly carry forward job...")
    async with AsyncSessionLocal() as db:
        current_year = datetime.now().year
        prev_year = current_year - 1
        
        policies_res = await db.execute(select(LeavePolicy))
        policies = policies_res.scalars().all()
        
        employees_res = await db.execute(select(Employee).where(Employee.is_active == True))
        employees = employees_res.scalars().all()
        
        balances_res = await db.execute(select(LeaveBalance).where(LeaveBalance.year == prev_year))
        prev_balances = balances_res.scalars().all()
        
        emp_balance_map = {}
        for b in prev_balances:
            if b.employee_id not in emp_balance_map:
                emp_balance_map[b.employee_id] = {}
            emp_balance_map[b.employee_id][b.leave_type] = b
            
        # Also fetch existing current-year balances to avoid duplicate inserts
        existing_res = await db.execute(select(LeaveBalance).where(LeaveBalance.year == current_year))
        existing_balances = existing_res.scalars().all()
        existing_keys = {(b.employee_id, b.leave_type, b.organization_id) for b in existing_balances}
        
        for emp in employees:
            for p in policies:
                if p.organization_id == emp.organization_id and \
                   (p.department is None or p.department == emp.department) and \
                   (p.role is None or p.role == emp.role):
                    
                    # Skip if balance already exists for this year
                    if (emp.id, p.leave_type, emp.organization_id) in existing_keys:
                        continue
                    
                    prev_b = emp_balance_map.get(emp.id, {}).get(p.leave_type)
                    carry_forward = 0
                    if prev_b:
                        remaining = prev_b.total_days - prev_b.used_days
                        if remaining > 0:
                            carry_forward = min(remaining, p.max_carry_forward)
                            
                    # Create new balance for current year with organization_id
                    new_balance = LeaveBalance(
                        organization_id=emp.organization_id,
                        employee_id=emp.id,
                        leave_type=p.leave_type,
                        total_days=p.base_days + carry_forward,
                        used_days=0,
                        year=current_year
                    )
                    db.add(new_balance)
                    
        from app.modules.settings.models import AccrualLog
        log = AccrualLog(job_type="yearly_carry_forward", status="success", details=f"Processed carry forwards for {current_year}")
        db.add(log)
        await db.commit()
    logger.info("Finished yearly carry forward job.")

def start_scheduler():
    scheduler.add_job(run_monthly_accruals, CronTrigger(day=1, hour=0, minute=0))
    scheduler.add_job(run_yearly_carry_forward, CronTrigger(month=1, day=1, hour=0, minute=5))
    scheduler.start()
    logger.info("APScheduler started.")
