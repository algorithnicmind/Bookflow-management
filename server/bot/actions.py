from datetime import date
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.leaves.repositories import LeaveRepository
from app.modules.leaves.services import LeaveService
from app.modules.leaves.schemas import LeaveApplication
from app.modules.employees.models import Employee

async def _get_repo(db: AsyncSession, employee_id: int) -> LeaveRepository:
    """Helper: fetch employee's org_id and create a LeaveRepository."""
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return LeaveRepository(db, emp.organization_id)

async def get_balances_action(db: AsyncSession, employee_id: int) -> dict:
    """Fetch leave balances for the given employee."""
    try:
        repo = await _get_repo(db, employee_id)
        service = LeaveService(repo)
        balances = await service.get_balances(employee_id)
        
        # Format balance description for the user
        balance_texts = []
        for b in balances:
            balance_texts.append(
                f"- **{b['leave_type'].capitalize()}**: {b['remaining']} remaining (out of {b['total_days']})"
            )
        
        if not balance_texts:
            return {"success": True, "message": "No leave balances found for you."}
            
        summary = "Your current leave balances are:\n" + "\n".join(balance_texts)
        return {"success": True, "message": summary, "data": balances}
    except Exception as e:
        return {"success": False, "message": f"Failed to retrieve balances: {str(e)}"}

async def get_history_action(db: AsyncSession, employee_id: int, status: str = "all") -> dict:
    """Fetch leave request history for the given employee."""
    try:
        repo = await _get_repo(db, employee_id)
        service = LeaveService(repo)
        history = await service.get_leave_history(employee_id, status)
        
        if not history:
            return {"success": True, "message": f"You have no leave requests with status '{status}'."}
            
        history_texts = []
        # Show last 5 leaves
        for leave in history[:5]:
            status_str = leave["status"].capitalize()
            history_texts.append(
                f"- **{leave['leave_type'].capitalize()}**: {leave['days']} day(s) from {leave['start_date']} to {leave['end_date']} [Status: {status_str}]"
            )
        
        summary = f"Here is your recent leave history (showing last {min(5, len(history))} requests):\n" + "\n".join(history_texts)
        return {"success": True, "message": summary, "data": history}
    except Exception as e:
        return {"success": False, "message": f"Failed to retrieve leave history: {str(e)}"}

async def apply_leave_action(
    db: AsyncSession, 
    employee_id: int, 
    leave_type: str, 
    start_date: date, 
    end_date: date, 
    reason: str
) -> dict:
    """Apply for a leave on behalf of the employee."""
    try:
        # Normalize inputs
        leave_type = leave_type.lower().strip()
        
        # Verify leave_type is valid
        valid_types = ['casual', 'sick', 'earned', 'maternity', 'miscarriage', 'unpaid']
        if leave_type not in valid_types:
            return {
                "success": False, 
                "message": f"Invalid leave type '{leave_type}'. Allowed types are: {', '.join(valid_types)}."
            }

        repo = LeaveRepository(db)
        service = LeaveService(repo)
        
        # Prepare schema
        app_schema = LeaveApplication(
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            reason=reason
        )
        
        # Submit leave
        await service.apply_leave(employee_id, app_schema)
        return {
            "success": True, 
            "message": f"Successfully applied for {leave_type} leave from {start_date} to {end_date}."
        }
    except HTTPException as he:
        return {"success": False, "message": f"Application failed: {he.detail}"}
    except Exception as e:
        return {"success": False, "message": f"An unexpected error occurred during leave application: {str(e)}"}
