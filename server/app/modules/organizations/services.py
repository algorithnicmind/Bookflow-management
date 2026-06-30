from typing import List, Dict, Any
from fastapi import HTTPException
from app.modules.organizations.repositories import OrganizationRepository
from app.modules.organizations.schemas import OrganizationUpdate, RolePermissionUpdate, DepartmentCreate, DepartmentUpdate
from app.modules.settings.schemas import LeaveTypeCreate
from app.modules.organizations.models import Organization, RolePermission, Department
from app.modules.settings.models import LeaveType
from app.modules.employees.models import Employee, PlatformOwner

class OrganizationService:
    def __init__(self, repo: OrganizationRepository):
        self.repo = repo

    def _check_access(self, current_user: Employee | PlatformOwner, org_id: int, require_super_admin: bool = False):
        if not isinstance(current_user, PlatformOwner):
            if current_user.organization_id != org_id:
                raise HTTPException(status_code=403, detail="Forbidden")
            if require_super_admin and current_user.role != "super_admin":
                raise HTTPException(status_code=403, detail="Forbidden")

    async def list_organizations(self) -> List[Organization]:
        return await self.repo.get_all()

    async def get_organization(self, org_id: int) -> Organization:
        org = await self.repo.get_by_id(org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        return org

    async def update_organization(self, org_id: int, request: OrganizationUpdate) -> Organization:
        org = await self.get_organization(org_id)
        for key, value in request.model_dump(exclude_unset=True).items():
            setattr(org, key, value)
        return await self.repo.update(org)

    async def list_role_permissions(self, org_id: int, current_user: Employee | PlatformOwner) -> List[RolePermission]:
        self._check_access(current_user, org_id, require_super_admin=True)
        return await self.repo.get_role_permissions(org_id)

    async def update_role_permissions(self, org_id: int, role_name: str, request: RolePermissionUpdate, current_user: Employee | PlatformOwner) -> RolePermission:
        self._check_access(current_user, org_id, require_super_admin=True)
        role_perm = await self.repo.get_role_permission(org_id, role_name)
        if not role_perm:
            role_perm = RolePermission(organization_id=org_id, role_name=role_name, permissions=request.permissions)
            return await self.repo.create_role_permission(role_perm)
        else:
            role_perm.permissions = request.permissions
            return await self.repo.update(role_perm)

    async def delete_role_permissions(self, org_id: int, role_name: str, current_user: Employee | PlatformOwner):
        self._check_access(current_user, org_id, require_super_admin=True)
        role_perm = await self.repo.get_role_permission(org_id, role_name)
        if not role_perm:
            raise HTTPException(status_code=404, detail="Role not found")
        await self.repo.delete_role_permission(role_perm)

    async def list_departments(self, org_id: int, current_user: Employee | PlatformOwner) -> List[Department]:
        self._check_access(current_user, org_id)
        return await self.repo.get_departments(org_id)

    async def create_department(self, org_id: int, request: DepartmentCreate, current_user: Employee | PlatformOwner) -> Department:
        self._check_access(current_user, org_id)
        dept = Department(organization_id=org_id, name=request.name, description=request.description)
        return await self.repo.create_department(dept)

    async def update_department(self, org_id: int, dept_id: int, request: DepartmentUpdate, current_user: Employee | PlatformOwner) -> Department:
        self._check_access(current_user, org_id)
        dept = await self.repo.get_department_by_id(dept_id)
        if not dept or dept.organization_id != org_id:
            raise HTTPException(status_code=404, detail="Department not found")
        if request.name is not None:
            dept.name = request.name
        if request.description is not None:
            dept.description = request.description
        return await self.repo.update(dept)

    async def delete_department(self, org_id: int, dept_id: int, current_user: Employee | PlatformOwner):
        self._check_access(current_user, org_id)
        dept = await self.repo.get_department_by_id(dept_id)
        if not dept or dept.organization_id != org_id:
            raise HTTPException(status_code=404, detail="Department not found")
        await self.repo.delete_department(dept)

    async def get_organization_dashboard(self, org_id: int) -> Dict[str, Any]:
        org = await self.get_organization(org_id)
        employees = await self.repo.get_employees(org.id)

        total_super_admins = 0
        total_admins = 0
        total_managers = 0
        total_employees = 0

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

        if unassigned:
            hierarchy.append({
                "id": "unassigned",
                "name": "Unassigned / Direct Reports",
                "role": "group",
                "reports": unassigned
            })

        audit_logs = await self.repo.get_recent_audit_logs(org.id)
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

    async def list_leave_types(self, org_id: int, current_user: Employee | PlatformOwner) -> List[LeaveType]:
        self._check_access(current_user, org_id, require_super_admin=True)
        return await self.repo.get_leave_types(org_id)

    async def create_leave_type(self, org_id: int, request: LeaveTypeCreate, current_user: Employee | PlatformOwner) -> LeaveType:
        self._check_access(current_user, org_id, require_super_admin=True)
        new_type = LeaveType(**request.model_dump(), organization_id=org_id)
        return await self.repo.create_leave_type(new_type)

    async def delete_leave_type(self, org_id: int, leave_type_id: int, current_user: Employee | PlatformOwner):
        self._check_access(current_user, org_id, require_super_admin=True)
        leave_type = await self.repo.get_leave_type(org_id, leave_type_id)
        if not leave_type:
            raise HTTPException(status_code=404, detail="Leave type not found")
        await self.repo.delete_leave_type(leave_type)
