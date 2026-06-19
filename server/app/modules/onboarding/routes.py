from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.modules.organizations.models import OnboardingApplication
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

class ApplicationRequest(BaseModel):
    company_name: str
    company_size: str
    admin_email: EmailStr
    special_requirements: str | None = None

class ApplicationResponse(BaseModel):
    id: int
    company_name: str
    admin_email: str
    status: str
    message: str

@router.post("/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(request: ApplicationRequest, db: AsyncSession = Depends(get_db)):
    # Check if application already exists
    result = await db.execute(select(OnboardingApplication).where(OnboardingApplication.admin_email == request.admin_email))
    existing_app = result.scalar_one_or_none()
    
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An application for this email already exists."
        )

    # Create new application
    new_app = OnboardingApplication(
        company_name=request.company_name,
        company_size=request.company_size,
        admin_email=request.admin_email,
        special_requirements=request.special_requirements,
        status="pending"
    )
    
    db.add(new_app)
    await db.commit()
    await db.refresh(new_app)
    
    return {
        "id": new_app.id,
        "company_name": new_app.company_name,
        "admin_email": new_app.admin_email,
        "status": new_app.status,
        "message": "Application submitted successfully. Our team will contact you shortly."
    }
