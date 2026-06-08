from datetime import datetime
from fastapi import HTTPException
from typing import List, Optional
from app.core.security import pwd_context
from app.modules.employees.repositories import EmployeeRepository
from app.modules.employees.models import Employee
from app.modules.employees.schemas import EmployeeCreate, EmployeeUpdate
from app.modules.leaves.models import LeaveBalance

class EmployeeService:
    def __init__(self, repo: EmployeeRepository):
        self.repo = repo

    async def get_employee_by_id(self, employee_id: int) -> Optional[Employee]:
        return await self.repo.get_by_id(employee_id)

    async def list_employees(self, search: Optional[str] = None) -> List[dict]:
        employees = await self.repo.list_employees(search)
        
        emp_responses = []
        for emp in employees:
            manager_name = None
            if emp.manager_id:
                manager = await self.repo.get_by_id(emp.manager_id)
                if manager:
                    manager_name = manager.name
            
            emp_responses.append({
                "id": emp.id,
                "name": emp.name,
                "email": emp.email,
                "role": emp.role,
                "department": emp.department,
                "manager_id": emp.manager_id,
                "is_active": emp.is_active,
                "created_at": emp.created_at,
                "manager_name": manager_name
            })
        return emp_responses

    async def create_employee(self, data: EmployeeCreate) -> Employee:
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
            
        hashed_password = pwd_context.hash(data.password)
        new_employee = Employee(
            name=data.name,
            email=data.email,
            password_hash=hashed_password,
            role=data.role,
            department=data.department,
            manager_id=data.manager_id
        )
        
        await self.repo.create(new_employee)
        
        current_year = datetime.now().year
        for leave_type, days in [("casual", 12), ("sick", 10), ("earned", 15)]:
            balance = LeaveBalance(
                employee_id=new_employee.id,
                leave_type=leave_type,
                total_days=days,
                year=current_year
            )
            self.repo.db.add(balance)
            
        await self.repo.commit()
        return new_employee

    async def update_employee(self, employee_id: int, data: EmployeeUpdate) -> Employee:
        emp = await self.repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        if data.name is not None: emp.name = data.name
        if data.role is not None: emp.role = data.role
        if data.department is not None: emp.department = data.department
        if data.manager_id is not None: emp.manager_id = data.manager_id
        
        await self.repo.commit()
        return emp

    async def deactivate_employee(self, employee_id: int, current_user_id: int) -> Employee:
        if current_user_id == employee_id:
            raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
            
        emp = await self.repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        emp.is_active = False
        await self.repo.commit()
        return emp
