from sqlalchemy import Column, ForeignKey, String, DateTime, Integer
from datetime import datetime
import uuid
from app.core.database import Base

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
