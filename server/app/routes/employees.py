from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Optional
from passlib.context import CryptContext
from datetime import datetime

from app.database import get_db
from app.models import Employee, LeaveBalance
from app.schemas import EmployeeResponse, EmployeeCreate, EmployeeUpdate
from app.dependencies import get_current_user, RoleChecker

router = APIRouter(prefix="/api/employees", tags=["employees"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("", response_model=dict)
async def list_employees(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    query = select(Employee)
    if search:
        query = query.where(
            or_(
                Employee.name.ilike(f"%{search}%"),
                Employee.email.ilike(f"%{search}%")
            )
        )
    
    result = await db.execute(query)
    employees = result.scalars().all()
    
    # Needs optimization in production to fetch managers efficiently, but fine for MVP
    emp_responses = []
    for emp in employees:
        manager_name = None
        if emp.manager_id:
            m_res = await db.execute(select(Employee).where(Employee.id == emp.manager_id))
            manager = m_res.scalar_one_or_none()
            if manager:
                manager_name = manager.name
                
        emp_data = EmployeeResponse.model_validate(emp)
        emp_data.manager_name = manager_name
        emp_responses.append(emp_data)
        
    return {"employees": emp_responses}

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_employee(
    request: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    result = await db.execute(select(Employee).where(Employee.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")
        
    hashed_password = pwd_context.hash(request.password)
    new_employee = Employee(
        name=request.name,
        email=request.email,
        password_hash=hashed_password,
        role=request.role,
        department=request.department,
        manager_id=request.manager_id
    )
    
    db.add(new_employee)
    await db.flush()
    
    current_year = datetime.now().year
    for leave_type, days in [("casual", 12), ("sick", 10), ("earned", 15)]:
        balance = LeaveBalance(employee_id=new_employee.id, leave_type=leave_type, total_days=days, year=current_year)
        db.add(balance)
        
    await db.commit()
    
    return {"message": "Employee created successfully"}

@router.put("/{employee_id}")
async def update_employee(
    employee_id: int,
    request: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    if request.name: emp.name = request.name
    if request.role: emp.role = request.role
    if request.department: emp.department = request.department
    if request.manager_id is not None: emp.manager_id = request.manager_id
    
    await db.commit()
    return {"message": "Employee updated successfully"}

@router.delete("/{employee_id}")
async def deactivate_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    if current_user.id == employee_id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
        
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    emp.is_active = False
    await db.commit()
    return {"message": "Employee deactivated successfully"}
