from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, List
from datetime import date, datetime

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    token: str
    user: dict

class AdminCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

# --- Employee Schemas ---
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

# --- Leave Schemas ---
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
