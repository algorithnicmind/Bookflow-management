from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.modules.employees.models import EmployeeImage

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.get("/{image_id}")
async def serve_uploaded_image(
    image_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EmployeeImage).where(EmployeeImage.id == image_id))
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=image.file_data, media_type=image.mime_type)
