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

@router.delete("/{org_id}/roles/{role_name}")
async def delete_role_permissions(
    org_id: int,
    role_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    if not isinstance(current_user, PlatformOwner):
        if current_user.organization_id != org_id or current_user.role != "super_admin":
            raise HTTPException(status_code=403, detail="Forbidden")
            
    result = await db.execute(select(RolePermission).where(
        (RolePermission.organization_id == org_id) &
        (RolePermission.role_name == role_name)
    ))
    role_perm = result.scalar_one_or_none()
    
    if not role_perm:
        raise HTTPException(status_code=404, detail="Role not found")
        
    await db.delete(role_perm)
    await db.commit()
    return {"message": "Role deleted"}

from app.modules.organizations.models import Department
from app.modules.organizations.schemas import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.core.tenant import get_current_tenant

@router.get("/{org_id}/departments", response_model=List[DepartmentResponse])
async def list_departments(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    if not isinstance(current_user, PlatformOwner):
        if current_user.organization_id != org_id:
            raise HTTPException(status_code=403, detail="Forbidden")
    result = await db.execute(select(Department).where(Department.organization_id == org_id))
    return result.scalars().all()

@router.post("/{org_id}/departments", response_model=DepartmentResponse)
async def create_department(
    org_id: int,
    request: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    dept = Department(organization_id=org_id, name=request.name, description=request.description)
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept

@router.put("/{org_id}/departments/{dept_id}", response_model=DepartmentResponse)
async def update_department(
    org_id: int,
    dept_id: int,
    request: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin", "admin"]))
):
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    dept = await db.get(Department, dept_id)
    if not dept or dept.organization_id != org_id:
        raise HTTPException(status_code=404, detail="Department not found")
    
    if request.name is not None:
        dept.name = request.name
    if request.description is not None:
        dept.description = request.description
        
    await db.commit()
    await db.refresh(dept)
    return dept

@router.delete("/{org_id}/departments/{dept_id}")
async def delete_department(
    org_id: int,
    dept_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["super_admin"]))
):
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    dept = await db.get(Department, dept_id)
    if not dept or dept.organization_id != org_id:
        raise HTTPException(status_code=404, detail="Department not found")
        
    await db.delete(dept)
    await db.commit()
    return {"message": "Department deleted"}


@router.get("/{org_id}/dashboard")
async def get_organization_dashboard(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(RequireOwner),
):
    """Get the full hierarchical structure and recent activity for an organization."""
    from app.modules.audit.models import AuditLog
    
    org_result = await db.execute(
        select(Organization).where(Organization.id == org_id)
    )
    org = org_result.scalar_one_or_none()

    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # 2. Fetch all Employees
    emp_result = await db.execute(select(Employee).where(Employee.organization_id == org.id))
    employees = emp_result.scalars().all()
    
    # 3. Build Hierarchy & Stats
    total_super_admins = 0
    total_admins = 0
    total_managers = 0
    total_employees = 0
    
    # Map employees by id
    emp_dict = {}
    for e in employees:
        emp_dict[e.id] = {
            "id": e.id,
            "name": e.name,
            "email": e.email,
            "role": e.role,
            "department": e.department,
            "last_login": e.last_login.isoformat() if e.last_login else None,
            "profile_image_url": getattr(e, 'profile_image_url', None),
            "reports": []
        }
        if e.role == 'super_admin':
            total_super_admins += 1
        elif e.role == 'admin':
            total_admins += 1
        elif e.role == 'manager':
            total_managers += 1
        else:
            total_employees += 1

    # Attach reports
    hierarchy = []
    unassigned = []
    for e in employees:
        node = emp_dict[e.id]
        if e.manager_id and e.manager_id in emp_dict:
            emp_dict[e.manager_id]["reports"].append(node)
        elif e.role in ('admin', 'super_admin'):
            hierarchy.append(node)
        else:
            unassigned.append(node)
            
    # Add unassigned to hierarchy if they don't have a manager and aren't admins
    if unassigned:
        hierarchy.append({
            "id": "unassigned",
            "name": "Unassigned / Direct Reports",
            "role": "group",
            "reports": unassigned
        })

    # 4. Fetch Recent Audit Logs
    audit_result = await db.execute(
        select(AuditLog)
        .join(Employee, Employee.id == AuditLog.actor_id)
        .where(Employee.organization_id == org.id)
        .order_by(AuditLog.created_at.desc())
        .limit(50)
    )
    audit_logs = audit_result.scalars().all()
    
    recent_activity = [
        {
            "id": log.id,
            "actor_name": log.actor_name,
            "action": log.action,
            "target_type": log.target_type,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        }
        for log in audit_logs
    ]

    return {
        "tenant_id": org.id,
        "company_name": org.name,
        "stats": {
            "total_employees": total_employees,
            "total_managers": total_managers,
            "total_super_admins": total_super_admins,
            "total_admins": total_admins,
        },
        "hierarchy": hierarchy,
        "recent_activity": recent_activity
    }

from app.modules.settings.models import LeaveType
from app.modules.settings.schemas import LeaveTypeCreate, LeaveTypeUpdate, LeaveTypeResponse

@router.get("/{org_id}/leave-types", response_model=List[LeaveTypeResponse])
async def list_leave_types(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    if not isinstance(current_user, PlatformOwner):
        if current_user.organization_id != org_id or current_user.role != "super_admin":
            raise HTTPException(status_code=403, detail="Forbidden")
    result = await db.execute(select(LeaveType).where(LeaveType.organization_id == org_id))
    return result.scalars().all()

@router.post("/{org_id}/leave-types", response_model=LeaveTypeResponse)
async def create_leave_type(
    org_id: int,
    request: LeaveTypeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    if not isinstance(current_user, PlatformOwner):
        if current_user.organization_id != org_id or current_user.role != "super_admin":
            raise HTTPException(status_code=403, detail="Forbidden")
    new_type = LeaveType(**request.model_dump(), organization_id=org_id)
    db.add(new_type)
    await db.commit()
    await db.refresh(new_type)
    return new_type

@router.delete("/{org_id}/leave-types/{leave_type_id}")
async def delete_leave_type(
    org_id: int,
    leave_type_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee | PlatformOwner = Depends(get_current_user)
):
    if not isinstance(current_user, PlatformOwner):
        if current_user.organization_id != org_id or current_user.role != "super_admin":
            raise HTTPException(status_code=403, detail="Forbidden")
    result = await db.execute(select(LeaveType).where(
        (LeaveType.id == leave_type_id) & (LeaveType.organization_id == org_id)
    ))
    leave_type = result.scalar_one_or_none()
    if not leave_type:
        raise HTTPException(status_code=404, detail="Leave type not found")
    await db.delete(leave_type)
    await db.commit()
    return {"message": "Leave type deleted"}
