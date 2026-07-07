"""
Employee Management API Routes
------------------------------
This module provides endpoints for managing employee profiles, viewing directories,
and securely managing system owner accounts.
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
import asyncio
from app.core.database import get_db
from app.core.dependencies import PermissionChecker, get_current_user, RequireOwner
from app.core.tenant import get_current_tenant
from app.core.security import pwd_context
from app.core.pagination import PaginationParams
from app.modules.organizations.models import Organization
from app.modules.employees.models import Employee, PlatformOwner
from app.modules.employees.schemas import EmployeeResponse, EmployeeCreate, EmployeeUpdate, EmployeeProfileUpdate
from app.modules.employees.repositories import EmployeeRepository
from app.modules.employees.services import EmployeeService

router = APIRouter(prefix="/api/employees", tags=["employees"])

def get_employee_service(
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_tenant)
) -> EmployeeService:
    """
    Dependency injection for EmployeeService.
    Automatically scoped to the current user's tenant (organization) to enforce multi-tenant isolation.
    """
    repo = EmployeeRepository(db, tenant.id)
    return EmployeeService(repo)

@router.get("/me", response_model=EmployeeResponse)
async def get_my_profile(
    current_user: Employee = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get Current User Profile.
    Used by the frontend to hydrate the AuthContext state on mount.
    Handles both regular Employees (who belong to an org) and PlatformOwners (who don't).
    """
    # Base validation mapping DB model to Pydantic schema
    resp = EmployeeResponse.model_validate(current_user)
    
    # Only resolve tenant information for users who actually belong to an organization
    # (PlatformOwners bypass this as they manage the whole system)
    if current_user.organization_id:
        repo = EmployeeRepository(db, current_user.organization_id)
        emp = await repo.get_by_id(current_user.id)
        if emp:
            resp = EmployeeResponse.model_validate(emp)
        
        try:
            tenant = await get_current_tenant(current_user, db)
            resp.organization_name = tenant.name
        except Exception:
            pass  # Organization might be inactive or missing — still return the profile without crashing
        
    return resp

@router.put("/me", response_model=EmployeeResponse)
async def update_my_profile(
    request: EmployeeProfileUpdate,
    current_user: Employee = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update Current User Profile.
    Allows employees to dynamically update non-administrative personal fields 
    like their name, password, or department.
    """
    # Handle Platform Owners who don't have a specific tenant logic
    if isinstance(current_user, PlatformOwner) or not current_user.organization_id:
        if request.name:
            current_user.name = request.name
        if request.email is not None:
            current_user.email = request.email
        if request.password:
            hashed = await asyncio.to_thread(pwd_context.hash, request.password)
            current_user.password_hash = hashed
        if request.department is not None:
            current_user.department = request.department
        
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
        return EmployeeResponse.model_validate(current_user)

    # Handle standard employees by routing through the tenant-isolated EmployeeService
    tenant = await get_current_tenant(current_user, db)
    repo = EmployeeRepository(db, tenant.id)
    service = EmployeeService(repo)
    emp = await service.update_profile(current_user.id, request)
    return EmployeeResponse.model_validate(emp)

@router.get("/system-owners", response_model=dict)
async def list_system_owners(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner)
):
    """
    List System Owners.
    Restricted entirely to users in the 'System' department (RequireOwner).
    Used for global platform management (viewing all root-level admins).
    """
    result = await db.execute(
        select(PlatformOwner).where(PlatformOwner.is_active == True)
    )
    owners = result.scalars().all()
    return {"owners": [
        {
            "id": o.id,
            "name": o.name,
            "email": o.email,
            "role": o.role,
            "department": o.department,
            "is_active": o.is_active,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "profile_image_url": o.profile_image_url,
        }
        for o in owners
    ]}

@router.post("/system-owners", status_code=status.HTTP_201_CREATED)
async def create_system_owner(
    request: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RequireOwner)
):
    """
    Create a new System Owner.
    Only an existing System Owner can call this endpoint to add a new colleague.
    """
    # Prevent duplicate emails
    result = await db.execute(select(PlatformOwner).where(PlatformOwner.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = await asyncio.to_thread(pwd_context.hash, request.password)
    owner = PlatformOwner(
        name=request.name,
        email=request.email,
        password_hash=hashed_password,
        role="platform_owner",
        department="System",
        is_active=True
    )
    db.add(owner)
    await db.commit()
    await db.refresh(owner)
    return {"message": "Owner created successfully", "owner": EmployeeResponse.model_validate(owner)}

@router.get("", response_model=dict)
async def list_employees(
    search: Optional[str] = None,
    pagination: PaginationParams = Depends(),
    service: EmployeeService = Depends(get_employee_service),
    current_user: Employee = Depends(PermissionChecker("manage_employees"))
):
    """
    List all employees within the current organization.
    Requires the user to hold the 'manage_employees' permission.
    Supports pagination (page, per_page) and optional search filtering.
    """
    employees = await service.list_employees(search)
    # Apply in-memory pagination (until repository supports SQL-level pagination)
    total = len(employees)
    paginated = employees[pagination.offset:pagination.offset + pagination.per_page]
    return {
        "employees": paginated,
        "total": total,
        "page": pagination.page,
        "per_page": pagination.per_page,
    }

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_employee(
    request: EmployeeCreate,
    service: EmployeeService = Depends(get_employee_service),
    current_user: Employee = Depends(PermissionChecker("manage_employees")),
    current_org: Organization = Depends(get_current_tenant)
):
    """
    Create a new employee profile in the current organization.
    The service layer will ensure appropriate leave balances are automatically provisioned.
    """
    employee = await service.create_employee(request, current_user.id, current_org.id)
    return {"message": "Employee created successfully", "employee": EmployeeResponse.model_validate(employee)}

@router.put("/{employee_id}")
async def update_employee(
    employee_id: int,
    request: EmployeeUpdate,
    service: EmployeeService = Depends(get_employee_service),
    current_user: Employee = Depends(PermissionChecker("manage_employees"))
):
    """
    Update an existing employee's administrative details (e.g., changing their role or manager).
    Requires 'manage_employees' permission.
    """
    await service.update_employee(employee_id, request, current_user.id)
    return {"message": "Employee updated successfully"}

@router.delete("/{employee_id}")
async def deactivate_employee(
    employee_id: int,
    service: EmployeeService = Depends(get_employee_service),
    current_user: Employee = Depends(PermissionChecker("manage_employees"))
):
    """
    Soft-deletes (deactivates) an employee from the organization.
    The employee's historical data (leaves, approvals) is retained for audit purposes.
    """
    await service.deactivate_employee(employee_id, current_user.id)
    return {"message": "Employee deactivated successfully"}
