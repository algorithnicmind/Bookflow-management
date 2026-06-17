from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    actor_email: Optional[str] = None
    action: str
    target_type: str
    target_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
