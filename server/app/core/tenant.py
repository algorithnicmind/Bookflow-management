from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.employees.models import Employee
from app.modules.organizations.models import Organization

async def get_current_tenant(
    current_user: Employee = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Organization:
    """
    Retrieves the Organization (Tenant) associated with the currently authenticated user.
    If the user does not belong to an active organization, raises a 403 Forbidden.
    """
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to any organization. Please complete onboarding.",
        )
    
    result = await db.execute(select(Organization).where(Organization.id == current_user.organization_id))
    organization = result.scalar_one_or_none()
    
    if not organization or not organization.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your organization is inactive or could not be found.",
        )
    
    return organization
