from pydantic import BaseModel
from typing import Optional

class SettingsUpdate(BaseModel):
    max_casual_leave: Optional[int] = None
    max_sick_leave: Optional[int] = None
    max_earned_leave: Optional[int] = None
    max_maternity_leave: Optional[int] = None
    max_miscarriage_leave: Optional[int] = None

class SettingsResponse(BaseModel):
    message: str = "Settings updated successfully"

from datetime import date
from typing import List

class PublicHolidayCreate(BaseModel):
    name: str
    date: date
    region: Optional[str] = None

class PublicHolidayResponse(PublicHolidayCreate):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

class ApprovalStepCreate(BaseModel):
    step_order: int
    role_required: str

class ApprovalStepResponse(ApprovalStepCreate):
    id: int

    class Config:
        from_attributes = True

class ApprovalChainCreate(BaseModel):
    department: Optional[str] = None
    steps: List[ApprovalStepCreate]

class ApprovalChainResponse(BaseModel):
    id: int
    department: Optional[str] = None
    steps: List[ApprovalStepResponse]

    class Config:
        from_attributes = True

class LeavePolicyBase(BaseModel):
    name: str
    department: Optional[str] = None
    role: Optional[str] = None
    leave_type: str
    base_days: int = 0
    accrual_rate: float = 0.0
    max_carry_forward: int = 0

class LeavePolicyCreate(LeavePolicyBase):
    pass

class LeavePolicyResponse(LeavePolicyBase):
    id: int

    class Config:
        from_attributes = True
