"""
Dashboard API Routes
--------------------
Aggregates high-level statistics (pending requests, team absence, recent activity)
to populate the main dashboard for employees and managers.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.employees.models import Employee
from app.modules.dashboard.schemas import DashboardResponse
from app.modules.dashboard.services import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardResponse)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    service = DashboardService(db)
    return await service.get_stats(current_user)
