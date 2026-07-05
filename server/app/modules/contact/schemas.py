from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class ContactMessageResponse(BaseModel):
    id: str
    name: str
    email: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
