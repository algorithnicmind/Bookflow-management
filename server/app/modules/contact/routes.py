from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.contact.models import ContactMessage
from app.modules.contact.schemas import ContactMessageCreate, ContactMessageResponse

router = APIRouter(prefix="/api/contact", tags=["Contact"])

@router.post("", response_model=ContactMessageResponse)
async def submit_contact_message(message: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
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
