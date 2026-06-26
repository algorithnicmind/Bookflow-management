from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.core.dependencies import RequireOwner, RoleChecker, get_current_user
from app.modules.organizations.models import Organization, RolePermission
from app.modules.organizations.schemas import OrganizationResponse, OrganizationUpdate, RolePermissionResponse, RolePermissionUpdate
from app.modules.employees.models import Employee, PlatformOwner

router = APIRouter(prefix="/api/organizations", tags=["organizations"])

@router.get("", response_model=List[OrganizationResponse])
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    result = await db.execute(select(Organization))
    return result.scalars().all()

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: int,
    request: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(RequireOwner)
):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(org, key, value)
        
    await db.commit()
    await db.refresh(org)
    return org

@router.get("/{org_id}/roles", response_model=List[RolePermissionResponse])
async def list_role_permissions(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    # Platform owners or super_admin of the organization
    if not isinstance(current_user, PlatformOwner):
        if current_user.organization_id != org_id or current_user.role != "super_admin":
            raise HTTPException(status_code=403, detail="Forbidden")
            
    result = await db.execute(select(RolePermission).where(RolePermission.organization_id == org_id))
    return result.scalars().all()

@router.put("/{org_id}/roles/{role_name}", response_model=RolePermissionResponse)
async def update_role_permissions(
    org_id: int,
    role_name: str,
    request: RolePermissionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    # Platform owners or super_admin of the organization
    if not isinstance(current_user, PlatformOwner):
        if current_user.organization_id != org_id or current_user.role != "super_admin":
            raise HTTPException(status_code=403, detail="Forbidden")
            
    result = await db.execute(select(RolePermission).where(
        (RolePermission.organization_id == org_id) &
        (RolePermission.role_name == role_name)
    ))
    role_perm = result.scalar_one_or_none()
    
    if not role_perm:
        role_perm = RolePermission(organization_id=org_id, role_name=role_name, permissions=request.permissions)
        db.add(role_perm)
    else:
        role_perm.permissions = request.permissions
        
    await db.commit()
    await db.refresh(role_perm)
    return role_perm
