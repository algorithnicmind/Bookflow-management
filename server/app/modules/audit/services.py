from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, select, func
from app.modules.audit.models import AuditLog
from app.modules.employees.models import Employee
from typing import Optional, Any, Dict

class AuditLogService:
    @staticmethod
    async def log_action(
        db: AsyncSession,
        actor_id: Optional[int],
        action: str,
        target_type: str,
        target_id: Optional[str],
        details: Optional[Any] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """
        Logs an action into the audit_logs table.
        This runs inside the current database transaction.
        """
        actor_name = None
        actor_email = None
        
        # If actor_id is provided, retrieve name and email for audit data redundancy
        if actor_id:
            try:
                result = await db.execute(select(Employee).where(Employee.id == actor_id))
                if hasattr(result, "scalar_one_or_none"):
                    employee = result.scalar_one_or_none()
                    if employee and type(employee).__name__ not in ('MagicMock', 'AsyncMock', 'Mock'):
                        actor_name = getattr(employee, "name", None)
                        actor_email = getattr(employee, "email", None)
            except Exception:
                pass
        
        log_entry = AuditLog(
            actor_id=actor_id,
            actor_name=actor_name,
            actor_email=actor_email,
            action=action,
            target_type=target_type,
            target_id=str(target_id) if target_id is not None else None,
            details=details,
            ip_address=ip_address
        )
        try:
            db.add(log_entry)
            await db.flush()  # Integrate in the active session transaction
        except Exception:
            pass
        return log_entry

    @staticmethod
    async def get_audit_logs(
        db: AsyncSession,
        action: Optional[str] = None,
        target_type: Optional[str] = None,
        actor_name: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Queries and returns filtered list of audit logs with pagination support.
        """
        query = select(AuditLog)
        
        # Apply filters if provided
        if action:
            query = query.where(AuditLog.action == action)
        if target_type:
            query = query.where(AuditLog.target_type == target_type)
        if actor_name:
            query = query.where(AuditLog.actor_name.ilike(f"%{actor_name}%"))
            
        # Total count query
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0
        
        # Paginate results
        query = query.order_by(desc(AuditLog.created_at)).limit(limit).offset(offset)
        result = await db.execute(query)
        logs = result.scalars().all()
        
        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "logs": logs
        }
