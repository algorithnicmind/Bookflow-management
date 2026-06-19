from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    max_casual_leave = Column(Integer, nullable=False, default=12)
    max_sick_leave = Column(Integer, nullable=False, default=12)
    max_earned_leave = Column(Integer, nullable=False, default=18)
    max_maternity_leave = Column(Integer, nullable=False, default=182)
    max_miscarriage_leave = Column(Integer, nullable=False, default=42)

class PublicHoliday(Base):
    __tablename__ = "public_holidays"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    region = Column(String(50), nullable=True)

class ApprovalChain(Base):
    __tablename__ = "approval_chains"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    department = Column(String(100), index=True) # None means global
    
    steps = relationship("ApprovalStep", back_populates="chain", cascade="all, delete-orphan")

class ApprovalStep(Base):
    __tablename__ = "approval_steps"

    id = Column(Integer, primary_key=True, index=True)
    chain_id = Column(Integer, ForeignKey("approval_chains.id", ondelete="CASCADE"), nullable=False)
    step_order = Column(Integer, nullable=False) # 1, 2, 3
    role_required = Column(String(20), nullable=False) # "manager", "admin", "super_admin"

    chain = relationship("ApprovalChain", back_populates="steps")

class LeavePolicy(Base):
    __tablename__ = "leave_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=True) # If null, applies globally
    role = Column(String(20), nullable=True) # If null, applies to all roles
    leave_type = Column(String(20), nullable=False) # casual, sick, earned, etc.
    base_days = Column(Integer, nullable=False, default=0)
    accrual_rate = Column(Float, nullable=False, default=0.0) # Days accrued per month
    max_carry_forward = Column(Integer, nullable=False, default=0) # Max days that can be carried over yearly
    
class AccrualLog(Base):
    __tablename__ = "accrual_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String(50), nullable=False) # e.g. 'monthly_accrual', 'yearly_carry_forward'
    run_date = Column(DateTime(timezone=True), default=func.now())
    status = Column(String(20), nullable=False) # 'success', 'failed'
    details = Column(String(255), nullable=True)
