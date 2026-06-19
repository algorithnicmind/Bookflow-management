from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type = Column(String(20), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    current_approval_step = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint(leave_type.in_(['casual', 'sick', 'earned', 'maternity', 'miscarriage', 'unpaid']), name="check_leave_type"),
        CheckConstraint(status.in_(['pending', 'approved', 'rejected', 'cancelled']), name="check_leave_status"),
    )

    employee = relationship("Employee", back_populates="leave_requests")
    approval = relationship("LeaveApproval", back_populates="leave_request", uselist=False, cascade="all, delete-orphan")


class LeaveApproval(Base):
    __tablename__ = "leave_approvals"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_request_id = Column(Integer, ForeignKey("leave_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    action = Column(String(20), nullable=False)
    comments = Column(Text, nullable=True)
    acted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint(action.in_(['approved', 'rejected']), name="check_approval_action"),
    )

    leave_request = relationship("LeaveRequest", back_populates="approval")
    manager = relationship("Employee")


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    leave_type = Column(String(20), nullable=False)
    total_days = Column(Integer, nullable=False)
    used_days = Column(Integer, nullable=False, default=0)
    year = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint(leave_type.in_(['casual', 'sick', 'earned', 'maternity', 'miscarriage']), name="check_balance_leave_type"),
        UniqueConstraint('employee_id', 'leave_type', 'year', 'organization_id', name='uq_employee_leave_year_org'),
    )

    employee = relationship("Employee", back_populates="leave_balances")
