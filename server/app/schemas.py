from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
import re

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class AdminCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v

# --- Employee Schemas ---
VALID_ROLES = ["super_admin", "admin", "manager", "employee"]

class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = Field(..., pattern="^(super_admin|admin|manager|employee)$")
    department: str = Field(..., min_length=1, max_length=100)
    manager_id: Optional[int] = None

class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v

class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[str] = Field(None, pattern="^(super_admin|admin|manager|employee)$")
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    manager_id: Optional[int] = None

class EmployeeResponse(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime
    manager_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Leave Schemas ---
class LeaveApplication(BaseModel):
    leave_type: str = Field(..., pattern="^(casual|sick|earned|unpaid)$")
    start_date: date
    end_date: date
    reason: str = Field(..., min_length=3, max_length=500)

class LeaveApprovalAction(BaseModel):
    comments: str = Field(..., max_length=500)

class LeaveApprovalResponse(BaseModel):
    manager_name: str
    action: str
    comments: Optional[str]
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

# --- Dashboard Schemas ---
class DashboardStats(BaseModel):
    total_requests: int = 0
    pending: int = 0
    approved: int = 0
    rejected: int = 0

class DashboardResponse(BaseModel):
    role: str
    stats: DashboardStats
    team_pending_count: Optional[int] = None
    team_on_leave_today: Optional[List[str]] = None
    org_stats: Optional[dict] = None
    recent_leaves: List[LeaveResponse] = []
    balances: List[LeaveBalanceResponse] = []
