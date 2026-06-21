from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    clerk_id = Column(String(255), unique=True, index=True, nullable=True)
    role = Column(String(20), nullable=False, index=True)
    manager_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    department = Column(String(100), nullable=True, default="General")
    gender = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    phone_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint(role.in_(['super_admin', 'admin', 'manager', 'employee']), name="check_employee_role"),
        UniqueConstraint('organization_id', 'email', name='uq_org_email'),
    )

    organization = relationship("Organization")
    manager = relationship("Employee", remote_side=[id], backref="direct_reports")
    leave_requests = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")
    leave_balances = relationship("LeaveBalance", back_populates="employee", cascade="all, delete-orphan")
