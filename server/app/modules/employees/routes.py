from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import RoleChecker, get_current_user, RequireOwner
from app.core.tenant import get_current_tenant
from app.core.security import pwd_context
from app.modules.organizations.models import Organization
from app.modules.employees.models import Employee
from app.modules.employees.schemas import EmployeeResponse, EmployeeCreate, EmployeeUpdate
from app.modules.employees.repositories import EmployeeRepository
from app.modules.employees.services import EmployeeService

router = APIRouter(prefix="/api/employees", tags=["employees"])

def get_employee_service(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant)
) -> EmployeeService:
    repo = EmployeeRepository(db, tenant.id)
    return EmployeeService(repo)

@router.get("/me", response_model=EmployeeResponse)
async def get_my_profile(
    current_user: Employee = Depends(get_current_user),
    service: EmployeeService = Depends(get_employee_service)
):
    emp = await service.get_employee_by_id(current_user.id)
    return EmployeeResponse.model_validate(emp)

from app.modules.employees.schemas import EmployeeProfileUpdate

@router.put("/me", response_model=EmployeeResponse)
async def update_my_profile(
    request: EmployeeProfileUpdate,
    current_user: Employee = Depends(get_current_user),
    service: EmployeeService = Depends(get_employee_service)
):
    emp = await service.update_profile(current_user.id, request)
    return EmployeeResponse.model_validate(emp)

from fastapi import HTTPException
from sqlalchemy.future import select

@router.get("/system-owners", response_model=dict)
async def list_system_owners(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner)
):
    result = await db.execute(
        select(Employee).where(Employee.department == 'System', Employee.is_active == True)
    )
    owners = result.scalars().all()
    return {"owners": [EmployeeResponse.model_validate(o) for o in owners]}

@router.post("/system-owners", status_code=status.HTTP_201_CREATED)
async def create_system_owner(
    request: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner)
):
    result = await db.execute(select(Employee).where(Employee.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    owner = Employee(
        organization_id=current_user.organization_id,
        name=request.name,
        email=request.email,
        password_hash=pwd_context.hash("Owner@123!"),
        role="super_admin",
        department="System",
        is_active=True
    )
    db.add(owner)
    await db.commit()
    await db.refresh(owner)
    return {"message": "Owner created successfully (Password: Owner@123!)", "owner": EmployeeResponse.model_validate(owner)}

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
