import os
import json
import logging
import hmac
import hashlib
from fastapi import APIRouter, Depends, Request, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.modules.leaves.models import LeaveRequest
from app.modules.leaves.repositories import LeaveRepository
from app.modules.leaves.services import LeaveService
from app.modules.leaves.schemas import LeaveApprovalAction
from app.modules.employees.models import Employee

logger = logging.getLogger("integrations")

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

async def verify_slack_signature(request: Request, body: bytes) -> bool:
    """Verifies that the request actually came from Slack."""
    signing_secret = os.environ.get("SLACK_SIGNING_SECRET")
    if not signing_secret or signing_secret == "mocksecret":
        # Skip verification in dev/mock environments
        return True

    timestamp = request.headers.get("X-Slack-Request-Timestamp")
    signature = request.headers.get("X-Slack-Signature")

    if not timestamp or not signature:
        return False

    # Check for replay attacks (timestamp older than 5 minutes)
    import time
    if abs(time.time() - int(timestamp)) > 60 * 5:
        return False

    sig_basestring = f"v0:{timestamp}:".encode("utf-8") + body
    my_signature = "v0=" + hmac.new(
        signing_secret.encode("utf-8"),
        sig_basestring,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(my_signature, signature)

@router.post("/slack/actions")
async def slack_actions(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()
    if not await verify_slack_signature(request, body):
        raise HTTPException(status_code=401, detail="Invalid Slack signature")

    # Slack sends the payload as a URL-encoded form field named 'payload'
    form_data = await request.form()
    payload_str = form_data.get("payload")
    if not payload_str:
        raise HTTPException(status_code=400, detail="Missing payload")

    payload = json.loads(payload_str)
    actions = payload.get("actions", [])
    if not actions:
        raise HTTPException(status_code=400, detail="No action found")

    action = actions[0]
    action_id = action.get("action_id") # e.g. "approve_leave" or "reject_leave"
    leave_id_str = action.get("value")

    if not leave_id_str:
        raise HTTPException(status_code=400, detail="Missing leave ID in action")

    leave_id = int(leave_id_str)

    # Fetch LeaveRequest to get organization ID and employee/manager details
    leave_res = await db.execute(
        select(LeaveRequest).where(LeaveRequest.id == leave_id)
    )
    leave = leave_res.scalar_one_or_none()
    if not leave:
        return {"text": f"Leave Request ID {leave_id} not found."}

    # Retrieve Manager to perform the action
    employee_res = await db.execute(
        select(Employee).where(Employee.id == leave.employee_id)
    )
    employee = employee_res.scalar_one_or_none()
    
    manager_id = None
    if employee and employee.manager_id:
        manager_id = employee.manager_id
    else:
        # Fallback to the first available manager/admin in the organization
        fallback_res = await db.execute(
            select(Employee).where(
                Employee.organization_id == leave.organization_id,
                Employee.role.in_(["manager", "admin", "super_admin"])
            )
        )
        fallback_mgr = fallback_res.scalar_one_or_none()
        if fallback_mgr:
            manager_id = fallback_mgr.id

    if not manager_id:
        return {"text": "Approving manager could not be determined."}

    # Initialize LeaveService for the organization
    repo = LeaveRepository(db, leave.organization_id)
    service = LeaveService(repo)

    approval_action = LeaveApprovalAction(
        comments=f"Acted via Slack by user: {payload.get('user', {}).get('username', 'Unknown')}"
    )

    try:
        if action_id == "approve_leave":
            await service.approve_leave(leave_id, manager_id, is_admin=True, action=approval_action)
            status_text = "Approved ✅"
        elif action_id == "reject_leave":
            await service.reject_leave(leave_id, manager_id, is_admin=True, action=approval_action)
            status_text = "Rejected ❌"
        else:
            return {"text": "Invalid action received."}
    except Exception as e:
        logger.error(f"Error handling Slack action: {str(e)}")
        return {"text": f"Error updating leave status: {str(e)}"}

    return {
        "text": f"Leave request for {employee.name if employee else 'Employee'} has been **{status_text}**."
    }

@router.post("/teams/actions")
async def teams_actions(request: Request, db: AsyncSession = Depends(get_db)):
    # MS Teams Action.Execute posts direct JSON
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    action = payload.get("action", {})
    action_verb = action.get("verb") # 'approve_leave' or 'reject_leave'
    action_data = action.get("data", {})
    leave_id_str = action_data.get("leave_id")

    if not leave_id_str:
        raise HTTPException(status_code=400, detail="Missing leave ID in action")

    leave_id = int(leave_id_str)

    # Fetch LeaveRequest to get organization ID and employee/manager details
    leave_res = await db.execute(
        select(LeaveRequest).where(LeaveRequest.id == leave_id)
    )
    leave = leave_res.scalar_one_or_none()
    if not leave:
        return {
            "type": "AdaptiveCard",
            "body": [{"type": "TextBlock", "text": f"Leave Request ID {leave_id} not found."}],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.4"
        }

    employee_res = await db.execute(
        select(Employee).where(Employee.id == leave.employee_id)
    )
    employee = employee_res.scalar_one_or_none()

    manager_id = None
    if employee and employee.manager_id:
        manager_id = employee.manager_id
    else:
        fallback_res = await db.execute(
            select(Employee).where(
                Employee.organization_id == leave.organization_id,
                Employee.role.in_(["manager", "admin", "super_admin"])
            )
        )
        fallback_mgr = fallback_res.scalar_one_or_none()
        if fallback_mgr:
            manager_id = fallback_mgr.id

    if not manager_id:
        return {
            "type": "AdaptiveCard",
            "body": [{"type": "TextBlock", "text": "Approving manager could not be determined."}],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.4"
        }

    repo = LeaveRepository(db, leave.organization_id)
    service = LeaveService(repo)

    username = payload.get("action", {}).get("user", {}).get("displayName", "Unknown")
    approval_action = LeaveApprovalAction(
        comments=f"Acted via Teams by user: {username}"
    )

    try:
        if action_verb == "approve_leave":
            await service.approve_leave(leave_id, manager_id, is_admin=True, action=approval_action)
            status_text = "Approved ✅"
        elif action_verb == "reject_leave":
            await service.reject_leave(leave_id, manager_id, is_admin=True, action=approval_action)
            status_text = "Rejected ❌"
        else:
            raise HTTPException(status_code=400, detail="Invalid action verb")
    except Exception as e:
        logger.error(f"Error handling Teams action: {str(e)}")
        return {
            "type": "AdaptiveCard",
            "body": [{"type": "TextBlock", "text": f"Error updating leave status: {str(e)}"}],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.4"
        }

    return {
        "type": "AdaptiveCard",
        "body": [
            {
                "type": "TextBlock",
                "text": f"Leave request for {employee.name if employee else 'Employee'} has been **{status_text}**.",
                "weight": "bolder",
                "color": "good" if "Approved" in status_text else "attention"
            }
        ],
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.4"
    }
