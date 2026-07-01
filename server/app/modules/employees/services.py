from datetime import datetime
import asyncio
from fastapi import HTTPException
from typing import List, Optional
from app.core.security import pwd_context
from app.modules.employees.repositories import EmployeeRepository
from app.modules.employees.models import Employee
from app.modules.employees.schemas import EmployeeCreate, EmployeeUpdate, EmployeeProfileUpdate
from app.modules.leaves.models import LeaveBalance
from app.modules.audit.services import AuditLogService

class EmployeeService:
    """
    Employee Service Layer
    ----------------------
    Handles business logic for managing employees within a specific tenant (organization).
    All database operations in this service inherently filter by the `organization_id`
    injected into the repository to ensure strict multi-tenant data isolation.
    """
    def __init__(self, repo: EmployeeRepository):
        self.repo = repo

    async def get_employee_by_id(self, employee_id: int) -> Optional[Employee]:
        return await self.repo.get_by_id(employee_id)

    async def list_employees(self, search: Optional[str] = None) -> List[dict]:
        """
        Retrieves all employees for the current organization, optionally filtered by search.
        Resolves manager names manually for frontend display.
        """
        employees = await self.repo.list_employees(search)
        
        emp_responses = []
        for emp in employees:
            # Resolve manager name dynamically
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
                "manager_name": manager_name,
                "gender": emp.gender
            })
        return emp_responses

    async def create_employee(self, data: EmployeeCreate, actor_id: Optional[int] = None) -> Employee:
        """
        Creates a new employee profile.
        
        Flow:
        1. Validates email uniqueness globally.
        2. Hashes password in a non-blocking thread.
        3. Creates Employee record.
        4. Fetches custom leave policies (or defaults to system settings) for the org.
        5. Provisions leave balances for the current year based on those policies.
        6. Emits an AuditLog event.
        """
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
            
        hashed_password = await asyncio.to_thread(pwd_context.hash, data.password)
        new_employee = Employee(
            organization_id=self.repo.organization_id, # Safely bound to current tenant
            name=data.name,
            email=data.email,
            password_hash=hashed_password,
            role=data.role,
            department=data.department,
            manager_id=data.manager_id,
            gender=data.gender
        )
        
        await self.repo.create(new_employee)
        
        current_year = datetime.now().year
        
        # Load defaults from per-tenant SystemSetting
        from sqlalchemy.future import select
        from app.modules.settings.models import SystemSetting, LeavePolicy
        settings_res = await self.repo.db.execute(
            select(SystemSetting).where(SystemSetting.organization_id == self.repo.organization_id)
        )
        org_settings = settings_res.scalar_one_or_none()
        default_balances = {
            "casual": org_settings.max_casual_leave if org_settings else 12,
            "sick": org_settings.max_sick_leave if org_settings else 12,
            "earned": org_settings.max_earned_leave if org_settings else 18,
            "maternity": org_settings.max_maternity_leave if org_settings else 182,
            "miscarriage": org_settings.max_miscarriage_leave if org_settings else 42
        }
        
        # Load custom policies specific to this organization
        policies_res = await self.repo.db.execute(
            select(LeavePolicy).where(LeavePolicy.organization_id == self.repo.organization_id)
        )
        policies = policies_res.scalars().all()
        
        # Apply policies (department-specific or role-specific overrides supersede defaults)
        for p in policies:
            if (p.department is None or p.department == new_employee.department) and \
               (p.role is None or p.role == new_employee.role):
                if p.leave_type in default_balances:
                    default_balances[p.leave_type] = p.base_days
                else:
                    default_balances[p.leave_type] = p.base_days

        # Provision the computed balances
        for leave_type, days in default_balances.items():
            balance = LeaveBalance(
                organization_id=self.repo.organization_id,
                employee_id=new_employee.id,
                leave_type=leave_type,
                total_days=days,
                year=current_year
            )
            self.repo.db.add(balance)
            
        # Log audit trail for security tracking
        await AuditLogService.log_action(
            db=self.repo.db,
            actor_id=actor_id,
            action="employee_create",
            target_type="employee",
            target_id=new_employee.id,
            details={
                "name": new_employee.name,
                "email": new_employee.email,
                "role": new_employee.role,
                "department": new_employee.department
            }
        )
        await self.repo.commit()
        return new_employee

    async def update_employee(self, employee_id: int, data: EmployeeUpdate, actor_id: Optional[int] = None) -> Employee:
        """
        Updates administrative fields (role, department, manager) for an employee.
        """
        emp = await self.repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        # Capture old state for auditing
        old_data = {
            "name": emp.name,
            "role": emp.role,
            "department": emp.department,
            "manager_id": emp.manager_id,
            "gender": emp.gender
        }
        
        # Apply partial updates dynamically
        if data.name is not None: emp.name = data.name
        if data.role is not None: emp.role = data.role
        if data.department is not None: emp.department = data.department
        if data.manager_id is not None: emp.manager_id = data.manager_id
        if data.gender is not None: emp.gender = data.gender
        
        new_data = {
            "name": emp.name,
            "role": emp.role,
            "department": emp.department,
            "manager_id": emp.manager_id,
            "gender": emp.gender
        }
        
        # Log audit trail
        await AuditLogService.log_action(
            db=self.repo.db,
            actor_id=actor_id,
            action="employee_update",
            target_type="employee",
            target_id=employee_id,
            details={"old": old_data, "new": new_data}
        )
        
        await self.repo.commit()
        return emp

    async def update_profile(self, employee_id: int, data: "EmployeeProfileUpdate") -> Employee:
        """
        Allows an employee to update their own personal information (password, phone).
        """
        emp = await self.repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        if data.name is not None: emp.name = data.name
        
        # Validate email collisions if they change their email
        if data.email is not None:
            existing = await self.repo.get_by_email(data.email)
            if existing and existing.id != employee_id:
                raise HTTPException(status_code=409, detail="Email already in use")
            emp.email = data.email
            
        # Update password securely
        if data.password is not None and data.password.strip():
            hashed_password = await asyncio.to_thread(pwd_context.hash, data.password)
            emp.password_hash = hashed_password
            
        if data.location is not None: emp.location = data.location
        if data.date_of_birth is not None: emp.date_of_birth = data.date_of_birth
        if data.phone_number is not None: emp.phone_number = data.phone_number
        if data.department is not None: emp.department = data.department
        
        await AuditLogService.log_action(
            db=self.repo.db,
            actor_id=employee_id,
            action="profile_update",
            target_type="employee",
            target_id=employee_id,
            details={"email": emp.email}
        )
        
        await self.repo.commit()
        return emp

    async def deactivate_employee(self, employee_id: int, current_user_id: int) -> Employee:
        """
        Soft-deletes an employee account by setting is_active=False.
        Prevents users from accidentally deactivating their own account.
        """
        if current_user_id == employee_id:
            raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
            
        emp = await self.repo.get_by_id(employee_id)
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
            
        emp.is_active = False
        
        # Log audit trail
        await AuditLogService.log_action(
            db=self.repo.db,
            actor_id=current_user_id,
            action="employee_deactivate",
            target_type="employee",
            target_id=employee_id,
            details={"email": emp.email, "name": emp.name}
        )
        
        await self.repo.commit()
        return emp
