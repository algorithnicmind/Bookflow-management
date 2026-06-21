from fastapi import APIRouter, Request, HTTPException, Depends
from svix.webhooks import Webhook, WebhookVerificationError
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.employees.models import Employee
from app.modules.organizations.models import Organization

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

@router.post("/clerk")
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.CLERK_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="CLERK_WEBHOOK_SECRET is not set")
        
    payload = await request.body()
    headers = request.headers
    
    # Get the Svix headers
    svix_id = headers.get("svix-id")
    svix_timestamp = headers.get("svix-timestamp")
    svix_signature = headers.get("svix-signature")
    
    if not svix_id or not svix_timestamp or not svix_signature:
        raise HTTPException(status_code=400, detail="Missing svix headers")
        
    wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
    
    try:
        evt = wh.verify(payload, headers)
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    event_type = evt.get("type")
    data = evt.get("data", {})
    
    if event_type == "user.created":
        clerk_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        email = email_addresses[0].get("email_address") if email_addresses else None
        
        if not email:
            return {"message": "User created but no email found, skipping."}
            
        # Check if the user already exists by email (if they were onboarded/invited)
        result = await db.execute(select(Employee).where(Employee.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            # Update existing user with clerk_id
            user.clerk_id = clerk_id
            await db.commit()
            return {"message": "Existing user linked with Clerk ID."}
            
        # If user does not exist, they shouldn't just be created without an organization,
        # unless it's a completely open system. Given the multi-tenant architecture, 
        # a new user from OAuth needs to either create an Organization or be invited.
        # Since we have an onboarding flow, we might just log this or create a "Personal" org.
        # For this implementation, we will log that the user needs an organization.
        # This handles the Open Question 1 from the plan.
        print(f"New user {email} signed up via Clerk but has no organization. They must apply via onboarding.")
        
    return {"message": "Webhook processed successfully"}
