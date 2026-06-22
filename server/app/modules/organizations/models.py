from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    domain = Column(String(100), unique=True, index=True, nullable=True)
    plan_type = Column(String(20), default="starter", nullable=False) # starter, professional, enterprise
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class OnboardingApplication(Base):
    __tablename__ = "onboarding_applications"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), nullable=False)
    company_size = Column(String(50), nullable=False)
    admin_email = Column(String(255), nullable=False, index=True)
    admin_name = Column(String(100), nullable=True)
    admin_phone = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=True)
    admin_password_hash = Column(String(255), nullable=True)
    special_requirements = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False) # pending, contacted, interested_custom_pricing, not_interested
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
