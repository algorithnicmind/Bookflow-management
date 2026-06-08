from pydantic import BaseModel
from typing import Optional, List
from app.modules.leaves.schemas import LeaveResponse, LeaveBalanceResponse

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
