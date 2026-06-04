from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    department: str
    manager_id: Optional[int] = None

class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[int] = None

class EmployeeResponse(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime
    manager_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
