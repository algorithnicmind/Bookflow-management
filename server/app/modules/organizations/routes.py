"""
Organizations API Routes
------------------------
Manages tenant-level operations such as departments, roles, leave types,
and retrieving organization-wide dashboards.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import RequireOwner, PermissionChecker, get_current_user
from app.modules.organizations.schemas import OrganizationResponse, OrganizationUpdate, RolePermissionResponse, RolePermissionUpdate, DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.modules.settings.schemas import LeaveTypeCreate, LeaveTypeUpdate, LeaveTypeResponse
from app.modules.employees.models import Employee, PlatformOwner
from app.modules.organizations.repositories import OrganizationRepository
from app.modules.organizations.services import OrganizationService

router = APIRouter(prefix="/api/organizations", tags=["organizations"])

def get_org_service(db: AsyncSession = Depends(get_db)) -> OrganizationService:
    """Dependency injection to provide the OrganizationService to routes."""
    repo = OrganizationRepository(db)
    return OrganizationService(repo)

@router.get("", response_model=List[OrganizationResponse])
async def list_organizations(
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    """
    List All Organizations.
    Restricted to Platform Owners to view all tenants running on the platform.
    """
    return await service.list_organizations()

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: int,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    """
    Get Organization Details.
    Restricted to Platform Owners to inspect a specific tenant.
    """
    return await service.get_organization(org_id)

@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: int,
    request: OrganizationUpdate,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    """
    Update Organization Details (e.g., license expiration).
    Restricted to Platform Owners.
    """
    return await service.update_organization(org_id, request)

@router.get("/{org_id}/roles", response_model=List[RolePermissionResponse])
async def list_role_permissions(
    org_id: int,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    """
    List Roles & Permissions.
    Returns all defined roles and their granular permissions for the specified organization.
    """
    return await service.list_role_permissions(org_id, current_user)

@router.put("/{org_id}/roles/{role_name}", response_model=RolePermissionResponse)
async def update_role_permissions(
    org_id: int,
    role_name: str,
    request: RolePermissionUpdate,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    """
    Update Role Permissions.
    Modifies the permission matrix for a specific role within the tenant.
    """
    return await service.update_role_permissions(org_id, role_name, request, current_user)

@router.delete("/{org_id}/roles/{role_name}")
async def delete_role_permissions(
    org_id: int,
    role_name: str,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    """
    Delete a Role.
    Removes a custom role from the organization entirely.
    """
    await service.delete_role_permissions(org_id, role_name, current_user)
    return {"message": "Role deleted"}

@router.get("/{org_id}/departments", response_model=List[DepartmentResponse])
async def list_departments(
    org_id: int,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    """
    List Departments.
    Returns all departments configured for the organization.
    """
    return await service.list_departments(org_id, current_user)

@router.post("/{org_id}/departments", response_model=DepartmentResponse)
async def create_department(
    org_id: int,
    request: DepartmentCreate,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee = Depends(PermissionChecker("manage_employees"))
):
    """
    Create a new department within the organization.
    Requires 'manage_employees' permission.
    """
    return await service.create_department(org_id, request, current_user)

@router.put("/{org_id}/departments/{dept_id}", response_model=DepartmentResponse)
async def update_department(
    org_id: int,
    dept_id: int,
    request: DepartmentUpdate,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee = Depends(PermissionChecker("manage_employees"))
):
    """
    Update a department's details (like its name).
    """
    return await service.update_department(org_id, dept_id, request, current_user)

@router.delete("/{org_id}/departments/{dept_id}")
async def delete_department(
    org_id: int,
    dept_id: int,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee = Depends(PermissionChecker("manage_settings"))
):
    """
    Delete a department from the organization.
    Requires 'manage_settings' permission.
    """
    await service.delete_department(org_id, dept_id, current_user)
    return {"message": "Department deleted"}

@router.get("/{org_id}/dashboard")
async def get_organization_dashboard(
    org_id: int,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(RequireOwner),
):
    """
    Get Tenant Dashboard Stats.
    Provides aggregated usage statistics (employees, leaves) for a specific tenant.
    Restricted to Platform Owners for monitoring.
    """
    return await service.get_organization_dashboard(org_id)

@router.get("/{org_id}/leave-types", response_model=List[LeaveTypeResponse])
async def list_leave_types(
    org_id: int,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    """
    List Leave Types.
    Returns all configured leave types (e.g., Sick, Casual, Annual) for the organization.
    """
    return await service.list_leave_types(org_id, current_user)

@router.post("/{org_id}/leave-types", response_model=LeaveTypeResponse)
async def create_leave_type(
    org_id: int,
    request: LeaveTypeCreate,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    """
    Create a new Leave Type configuration for the organization.
    """
    return await service.create_leave_type(org_id, request, current_user)

@router.delete("/{org_id}/leave-types/{leave_type_id}")
async def delete_leave_type(
    org_id: int,
    leave_type_id: int,
    service: OrganizationService = Depends(get_org_service),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    """
    Delete a Leave Type from the organization's configuration.
    """
    await service.delete_leave_type(org_id, leave_type_id, current_user)
    return {"message": "Leave type deleted"}
