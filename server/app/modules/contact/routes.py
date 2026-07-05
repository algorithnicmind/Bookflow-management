"""
Contact & Support API Routes
----------------------------
Handles incoming contact form submissions from the landing page.
Stores inquiries as leads for the Platform Owner to review.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.dependencies import RequireOwner, limiter
from app.modules.contact.models import ContactMessage
from app.modules.contact.schemas import ContactMessageCreate, ContactMessageResponse
from typing import List

router = APIRouter(prefix="/api/contact", tags=["Contact"])

@router.post("", response_model=ContactMessageResponse)
@limiter.limit("10/hour")  # Rate limit contact form to prevent spam
async def submit_contact_message(request: Request, message: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
    try:
        new_msg = ContactMessage(
            name=message.name,
            email=message.email,
            message=message.message
        )
        db.add(new_msg)
        await db.commit()
        await db.refresh(new_msg)
        return new_msg
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save contact message")

@router.get("", response_model=List[ContactMessageResponse])
async def list_contact_messages(db: AsyncSession = Depends(get_db), current_user = Depends(RequireOwner)):
    """List all contact messages for the platform owner, ordered by newest first."""
    try:
        result = await db.execute(select(ContactMessage).order_by(ContactMessage.id.desc()))
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load contact messages")
