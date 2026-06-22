from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_name = Column(String(100), nullable=True)
    actor_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "leave_apply", "leave_approve", "employee_create"
    target_type = Column(String(50), nullable=False)  # e.g., "leave_request", "employee", "system_settings"
    target_id = Column(String(50), nullable=True)
    ip_address = Column(String(45), nullable=True)
    details = Column(JSON, nullable=True)  # Store JSON details of the action/diff
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    actor = relationship("Employee")
