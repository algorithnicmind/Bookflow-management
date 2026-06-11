from sqlalchemy import Column, Integer, String
from app.core.database import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    max_casual_leave = Column(Integer, nullable=False, default=12)
    max_sick_leave = Column(Integer, nullable=False, default=12)
    max_earned_leave = Column(Integer, nullable=False, default=18)
    max_maternity_leave = Column(Integer, nullable=False, default=182)
    max_miscarriage_leave = Column(Integer, nullable=False, default=42)
