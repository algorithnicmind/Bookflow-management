from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime

class LeaveApplication(BaseModel):
    leave_type: str = Field(..., pattern="^(casual|sick|earned|unpaid)$")
    start_date: date
    end_date: date
    reason: str

class LeaveApprovalAction(BaseModel):
    comments: str

class LeaveApprovalResponse(BaseModel):
    manager_name: str
    action: str
    comments: Optional[str] = None
    acted_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    status: str
    created_at: datetime
    updated_at: datetime
    days: Optional[int] = None
    employee_name: Optional[str] = None
    department: Optional[str] = None
    approval: Optional[LeaveApprovalResponse] = None

    model_config = ConfigDict(from_attributes=True)

class LeaveBalanceResponse(BaseModel):
    leave_type: str
    total_days: int
    used_days: int
    remaining: int

    model_config = ConfigDict(from_attributes=True)
