from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    domain = Column(String(100), unique=True, index=True, nullable=True)
    plan_type = Column(String(20), default="starter", nullable=False) # starter, professional, enterprise
    is_active = Column(Boolean, default=True, nullable=False)
    access_days = Column(Integer, default=30, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class OnboardingApplication(Base):
    __tablename__ = "onboarding_applications"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(100), nullable=False)
    company_size = Column(String(50), nullable=False)
    super_admin_email = Column(String(255), nullable=False, index=True)
    super_admin_name = Column(String(100), nullable=True)
    super_admin_phone = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=True)
    super_admin_password_hash = Column(String(255), nullable=True)
    special_requirements = Column(Text, nullable=True)
    selected_plan = Column(String(50), default="free_trial", nullable=True)
    status = Column(String(50), default="pending", nullable=False) # pending, contacted, interested_custom_pricing, not_interested
    internal_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
