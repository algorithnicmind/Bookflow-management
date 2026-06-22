"""
Audit Logs API Routes
---------------------
Exposes a read-only view of the immutable Audit Log.
Allows administrators to track who performed which actions (approvals, edits, logins) for compliance.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.core.database import get_db
from app.core.dependencies import RoleChecker
from app.modules.employees.models import Employee
from app.modules.audit.services import AuditLogService
from app.modules.audit.schemas import AuditLogResponse

router = APIRouter(prefix="/api/audit-logs", tags=["audit-logs"])

@router.get("")
async def get_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action name"),
    target_type: Optional[str] = Query(None, description="Filter by target resource type"),
    actor_name: Optional[str] = Query(None, description="Filter by actor employee name"),
    limit: int = Query(50, ge=1, le=100, description="Pagination page size limit"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(RoleChecker(["admin", "super_admin"]))
):
    """
    Retrieves compliance audit logs. Restricted to admins and super admins.
    """
    result = await AuditLogService.get_audit_logs(
        db=db,
        action=action,
        target_type=target_type,
        actor_name=actor_name,
        limit=limit,
        offset=offset
    )
    
    # Format database models to schemas
    formatted_logs = [AuditLogResponse.model_validate(log) for log in result["logs"]]
    
    return {
        "total": result["total"],
        "limit": result["limit"],
        "offset": result["offset"],
        "logs": formatted_logs
    }
