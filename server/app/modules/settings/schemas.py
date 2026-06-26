from pydantic import BaseModel
from typing import Optional

class SettingsUpdate(BaseModel):
    max_casual_leave: Optional[int] = None
    max_sick_leave: Optional[int] = None
    max_earned_leave: Optional[int] = None
    max_maternity_leave: Optional[int] = None
    max_miscarriage_leave: Optional[int] = None


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

class LeaveTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    default_days: int = 0
    is_paid: bool = True

class LeaveTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    default_days: Optional[int] = None
    is_paid: Optional[bool] = None

class LeaveTypeResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    description: Optional[str]
    default_days: int
    is_paid: bool
    
    class Config:
        from_attributes = True
class LeavePolicyResponse(LeavePolicyBase):
    id: int

    class Config:
        from_attributes = True
