from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import RoleChecker, get_current_user
from app.modules.employees.models import Employee
from app.modules.employees.schemas import EmployeeResponse, EmployeeCreate, EmployeeUpdate
from app.modules.employees.repositories import EmployeeRepository
from app.modules.employees.services import EmployeeService

router = APIRouter(prefix="/api/employees", tags=["employees"])

def get_employee_service(db: AsyncSession = Depends(get_db)) -> EmployeeService:
    repo = EmployeeRepository(db)
    return EmployeeService(repo)

@router.get("", response_model=dict)
async def list_employees(
    search: Optional[str] = None,
    service: EmployeeService = Depends(get_employee_service),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    employees = await service.list_employees(search)
    return {"employees": employees}

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_employee(
    request: EmployeeCreate,
    service: EmployeeService = Depends(get_employee_service),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    employee = await service.create_employee(request, current_user.id)
    return {"message": "Employee created successfully", "employee": EmployeeResponse.model_validate(employee)}

@router.put("/{employee_id}")
async def update_employee(
    employee_id: int,
    request: EmployeeUpdate,
    service: EmployeeService = Depends(get_employee_service),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    await service.update_employee(employee_id, request, current_user.id)
    return {"message": "Employee updated successfully"}

@router.delete("/{employee_id}")
async def deactivate_employee(
    employee_id: int,
    service: EmployeeService = Depends(get_employee_service),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    await service.deactivate_employee(employee_id, current_user.id)
    return {"message": "Employee deactivated successfully"}
