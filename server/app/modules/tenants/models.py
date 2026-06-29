from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    plan_type = Column(String(20), default="free_tier", nullable=False) # free_tier, professional, customization
    module_access = Column(JSON, nullable=True) # e.g. {"chatbot": true, "advanced_reports": false}
    max_employees = Column(Integer, nullable=True) # Override for max employees allowed
    is_active = Column(Boolean, default=True, nullable=False)
    access_days = Column(Integer, default=30, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
