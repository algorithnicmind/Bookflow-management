import asyncio
import re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from app.core.security import pwd_context
from app.modules.organizations.models import OnboardingApplication, Organization
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveBalance
from app.modules.onboarding.repositories import OnboardingRepository

class OnboardingService:
    def __init__(self):
        self.repository = OnboardingRepository()

    async def submit_application(self, request_data, db: AsyncSession) -> dict:
        existing_app = await self.repository.get_by_email(request_data.super_admin_email, db)
        if existing_app:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An application for this email already exists."
            )

        password_hash = None
        if request_data.admin_password:
            password_hash = await asyncio.to_thread(pwd_context.hash, request_data.admin_password)

        new_app = OnboardingApplication(
            company_name=request_data.company_name,
            company_size=request_data.company_size,
            super_admin_name=request_data.super_admin_name,
            super_admin_email=request_data.super_admin_email,
            super_admin_phone=request_data.super_admin_phone,
            industry=request_data.industry,
            super_admin_password_hash=password_hash,
            special_requirements=request_data.special_requirements,
            selected_plan=request_data.selected_plan or "free_trial",
            status="pending"
        )
        
        created_app = await self.repository.create(new_app, db)
        
        return {
            "id": created_app.id,
            "company_name": created_app.company_name,
            "super_admin_name": created_app.super_admin_name,
            "super_admin_email": created_app.super_admin_email,
            "super_admin_phone": created_app.super_admin_phone,
            "industry": created_app.industry,
            "selected_plan": created_app.selected_plan,
            "status": created_app.status,
            "message": "Application submitted successfully. Our team will contact you shortly."
        }

    async def list_applications(self, status_filter: Optional[str], db: AsyncSession) -> dict:
        applications = await self.repository.list_applications(status_filter, db)
        counts = await self.repository.get_counts(db)

        return {
            "applications": [
                {
                    "id": app.id,
                    "company_name": app.company_name,
                    "company_size": app.company_size,
                    "super_admin_name": app.super_admin_name,
                    "super_admin_email": app.super_admin_email,
                    "super_admin_phone": app.super_admin_phone,
                    "industry": app.industry,
                    "special_requirements": app.special_requirements,
                    "selected_plan": app.selected_plan or "free_trial",
                    "status": app.status,
                    "internal_notes": app.internal_notes,
                    "organization_id": app.organization_id,
                    "created_at": app.created_at.isoformat() if app.created_at else None,
                }
                for app in applications
            ],
            "counts": {
                "total": counts.total,
                "pending": counts.pending,
                "contacted": counts.contacted,
                "connected": counts.connected,
                "interested": counts.interested,
                "not_interested": counts.not_interested,
            },
        }

    async def update_status(self, application_id: int, new_status: str, db: AsyncSession) -> dict:
        application = await self.repository.get_by_id(application_id, db)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")

        application.status = new_status
        await db.commit()

        return {"message": f"Status updated to '{new_status}'.", "id": application.id, "status": new_status}

    async def get_application(self, application_id: int, db: AsyncSession) -> dict:
        application = await self.repository.get_by_id(application_id, db)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")

        org = None
        if application.organization_id:
            org = await self.repository.get_org_by_id(application.organization_id, db)

        emp = await self.repository.get_employee_by_email(application.super_admin_email, db)

        expires_at = org.expires_at.isoformat() if org and org.expires_at else None

        return {
            "id": application.id,
            "company_name": application.company_name,
            "company_size": application.company_size,
            "super_admin_name": emp.name if emp else application.super_admin_name,
            "super_admin_email": emp.email if emp else application.super_admin_email,
            "admin_role": emp.role if emp else None,
            "super_admin_phone": application.super_admin_phone,
            "industry": application.industry,
            "special_requirements": application.special_requirements,
            "selected_plan": application.selected_plan or "free_trial",
            "status": application.status,
            "internal_notes": application.internal_notes,
            "organization_id": application.organization_id,
            "created_at": application.created_at.isoformat() if application.created_at else None,
            "expires_at": expires_at,
        }

    async def update_notes(self, application_id: int, notes: str, db: AsyncSession) -> dict:
        application = await self.repository.get_by_id(application_id, db)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")

        application.internal_notes = notes
        await db.commit()

        return {"message": "Notes updated successfully.", "id": application.id}

    async def update_plan(self, application_id: int, plan: str, db: AsyncSession) -> dict:
        application = await self.repository.get_by_id(application_id, db)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")

        application.selected_plan = plan
        await db.commit()

        return {"message": f"Plan updated to '{plan}'.", "id": application.id, "selected_plan": application.selected_plan}

    async def approve_application(self, application_id: int, request_data, db: AsyncSession) -> dict:
        application = await self.repository.get_by_id(application_id, db)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")
        if application.status == "rejected":
            raise HTTPException(status_code=400, detail="Application was already rejected. Cannot provision a rejected application.")
        if application.status == "not_interested":
            raise HTTPException(status_code=400, detail="Cannot provision an application marked as 'not interested'. Update the status first.")

        if request_data and request_data.internal_notes is not None:
            application.internal_notes = request_data.internal_notes

        access_days_val = 30
        if request_data and request_data.access_days is not None:
            access_days_val = request_data.access_days
        expires_at_val = datetime.utcnow() + timedelta(days=access_days_val)

        existing_admin = await self.repository.get_employee_by_email(application.super_admin_email, db)
        if existing_admin:
            org = await self.repository.get_org_by_id(existing_admin.organization_id, db)
            if org:
                org.access_days = access_days_val
                org.expires_at = expires_at_val
                application.organization_id = org.id
                if request_data and request_data.password:
                    existing_admin.password_hash = await asyncio.to_thread(pwd_context.hash, request_data.password)
                    
                await db.commit()
                return {
                    "message": f"Tenant '{org.name}' configuration updated successfully.",
                    "organization": {"id": org.id, "name": org.name},
                    "admin": {"id": existing_admin.id, "email": existing_admin.email},
                }

        base_slug = re.sub(r'[^a-z0-9]+', '-', application.company_name.lower()).strip('-')
        domain = f"{base_slug}-{application.id}.leaveflow.com"

        org = Organization(
            name=application.company_name,
            domain=domain,
            plan_type="enterprise",
            is_active=True,
            access_days=access_days_val,
            expires_at=expires_at_val,
        )
        db.add(org)
        await db.flush()
        application.organization_id = org.id

        password_hash = None
        if request_data and request_data.password:
            password_hash = await asyncio.to_thread(pwd_context.hash, request_data.password)
        elif application.super_admin_password_hash:
            password_hash = application.super_admin_password_hash
            
        if not password_hash:
            raise HTTPException(
                status_code=400,
                detail="Cannot approve: no password set. Please provide a password in the request or ensure the lead has one."
            )

        admin_employee = Employee(
            organization_id=org.id,
            name=application.super_admin_name or "Admin User",
            email=application.super_admin_email,
            password_hash=password_hash,
            role="super_admin",
            department="Management",
            gender="not_specified",
            is_active=True,
        )
        db.add(admin_employee)
        await db.flush()

        current_year = datetime.today().year
        default_balances = [
            ("casual", 12),
            ("sick", 12),
            ("earned", 18),
            ("maternity", 182),
            ("miscarriage", 42),
        ]
        for leave_type, days in default_balances:
            balance = LeaveBalance(
                organization_id=org.id,
                employee_id=admin_employee.id,
                leave_type=leave_type,
                total_days=days,
                used_days=0,
                year=current_year,
            )
            db.add(balance)

        await db.commit()

        return {
            "message": f"Tenant '{org.name}' provisioned successfully.",
            "organization": {"id": org.id, "name": org.name},
            "admin": {"id": admin_employee.id, "email": admin_employee.email},
        }

    async def delete_tenant(self, application_id: int, db: AsyncSession) -> dict:
        application = await self.repository.get_by_id(application_id, db)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        admin_emp = await self.repository.get_employee_by_email(application.super_admin_email, db)
        
        if admin_emp:
            await self.repository.delete_tenant_data(admin_emp.organization_id, application_id, db)
        else:
            await db.execute(delete(OnboardingApplication).where(OnboardingApplication.id == application_id))
            await db.commit()

        return {"message": "Tenant and application successfully deleted."}

    async def reject_application(self, application_id: int, db: AsyncSession) -> dict:
        application = await self.repository.get_by_id(application_id, db)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")

        if application.status != "pending":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot reject an application with status '{application.status}'.",
            )

        application.status = "rejected"
        await db.commit()

        return {"message": "Application rejected.", "id": application.id, "status": "rejected"}
