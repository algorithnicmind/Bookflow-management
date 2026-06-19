"""
AccrualLedger Model
-------------------
Maintains a complete audit trail of every automated leave credit/debit:
  - Monthly accruals (system credits leaves on 1st of each month)
  - Year-end carry-forwards (unused earned leave rolled into next year)
  - Year-end resets (casual/sick balances zeroed out)

Each row is immutable — once written, it serves as a permanent financial-grade
record of the balance mutation, enabling compliance audits and dispute resolution.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class AccrualLedger(Base):
    __tablename__ = "accrual_ledger"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    leave_type = Column(String(20), nullable=False)

    # Type of accrual action performed
    # Values: "monthly_accrual" | "carry_forward" | "year_reset" | "manual_trigger"
    action_type = Column(String(30), nullable=False)

    # How many days were credited (positive) or reset (0 for resets)
    days_credited = Column(Float, nullable=False, default=0)

    # Snapshot of balance before and after the mutation
    balance_before = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)

    # Which year and month this accrual pertains to
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=True)  # null for carry-forward / year-reset

    # Timestamp of when the system executed this accrual
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    employee = relationship("Employee")

    # Composite indexes for fast querying
    __table_args__ = (
        Index("ix_accrual_employee_year", "employee_id", "year"),
        Index("ix_accrual_action_type", "action_type"),
    )
