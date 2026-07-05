"""
Notifications API Routes
------------------------
Manages the in-app notification center. Allows users to fetch their unread notifications
and mark them as read.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.employees.models import Employee
from app.modules.notifications.models import Notification

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
async def get_notifications(
    limit: int = Query(20, ge=1, le=100, description="Max notifications to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    current_user: Employee = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Count total for pagination metadata
        count_result = await db.execute(
            select(func.count()).select_from(Notification).where(Notification.user_id == current_user.id)
        )
        total = count_result.scalar() or 0

        result = await db.execute(
            select(Notification)
            .where(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        notifications = result.scalars().all()
        return {
            "notifications": [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "type": n.type,
                    "is_read": n.is_read,
                    "action_url": n.action_url,
                    "created_at": n.created_at.isoformat() if n.created_at else None,
                }
                for n in notifications
            ],
            "total": total,
            "limit": limit,
            "offset": offset,
        }
    except Exception:
        return {"notifications": [], "total": 0, "limit": limit, "offset": offset}


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: Employee = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    await db.commit()
    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_as_read(
    current_user: Employee = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "All notifications marked as read"}
