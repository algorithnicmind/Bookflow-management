from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base

class CalendarIntegration(Base):
    __tablename__ = "calendar_integrations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, unique=True)
    provider = Column(String(50), nullable=False) # 'google' or 'outlook'
    access_token = Column(String(512), nullable=False)
    refresh_token = Column(String(512), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
