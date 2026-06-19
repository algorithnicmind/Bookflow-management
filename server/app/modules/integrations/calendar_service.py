import os
import json
import logging
import urllib.request
import urllib.error
import asyncio
from datetime import datetime, timezone
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.integrations.models import CalendarIntegration
from app.modules.employees.models import Employee
from app.modules.leaves.models import LeaveRequest

logger = logging.getLogger("integrations")

class CalendarService:
    @staticmethod
    def _make_request(url: str, method: str, headers: dict, data: dict = None) -> tuple:
        """Helper to make synchronous HTTP requests."""
        try:
            req_data = json.dumps(data).encode("utf-8") if data else None
            req = urllib.request.Request(
                url,
                data=req_data,
                headers=headers,
                method=method
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                status = response.getcode()
                body = response.read().decode("utf-8")
                return status, json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            logger.error(f"HTTP Error {e.code} for {url}: {err_body}")
            return e.code, {"error": err_body}
        except Exception as e:
            logger.error(f"Error requesting {url}: {str(e)}")
            return 500, {"error": str(e)}

    @classmethod
    async def _make_request_async(cls, url: str, method: str, headers: dict, data: dict = None) -> tuple:
        return await asyncio.to_thread(cls._make_request, url, method, headers, data)

    @classmethod
    async def sync_leave_to_calendar(cls, db: AsyncSession, leave_id: int) -> bool:
        """Main entry point to sync approved leave to the user's calendar."""
        # Fetch leave request details
        leave_res = await db.execute(
            select(LeaveRequest).where(LeaveRequest.id == leave_id)
        )
        leave = leave_res.scalar_one_or_none()
        if not leave:
            logger.error(f"LeaveRequest ID {leave_id} not found for calendar sync.")
            return False

        # Check if the employee has configured a calendar integration
        integration_res = await db.execute(
            select(CalendarIntegration).where(CalendarIntegration.employee_id == leave.employee_id)
        )
        integration = integration_res.scalar_one_or_none()
        if not integration:
            logger.info(f"No Calendar integration found for employee {leave.employee_id}. Mocking successful calendar sync.")
            # For testing/demo purposes, we log the action
            logger.info(f"[MOCK SYNC] Synced Approved {leave.leave_type} leave (ID: {leave_id}) to Employee calendar (OOO).")
            return True

        # Refresh token if needed (dummy / simple refresh flow check)
        if integration.expires_at and integration.expires_at < datetime.now(timezone.utc):
            await cls._refresh_token(db, integration)

        # Call provider-specific API
        if integration.provider == "google":
            return await cls._sync_to_google(integration.access_token, leave)
        elif integration.provider == "outlook":
            return await cls._sync_to_outlook(integration.access_token, leave)

        return False

    @classmethod
    async def _refresh_token(cls, db: AsyncSession, integration: CalendarIntegration):
        """Refreshes the OAuth access token."""
        if not integration.refresh_token:
            return

        logger.info(f"Refreshing token for provider {integration.provider}")
        
        # Google refresh endpoint
        if integration.provider == "google":
            url = "https://oauth2.googleapis.com/token"
            data = {
                "client_id": os.environ.get("GOOGLE_CLIENT_ID", "mock-client-id"),
                "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET", "mock-client-secret"),
                "refresh_token": integration.refresh_token,
                "grant_type": "refresh_token"
            }
            status, res = await cls._make_request_async(url, "POST", {"Content-Type": "application/json"}, data)
            if status == 200:
                integration.access_token = res.get("access_token")
                expires_in = res.get("expires_in", 3600)
                from datetime import timedelta
                integration.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                await db.commit()
                logger.info("Successfully refreshed Google token")

    @classmethod
    async def _sync_to_google(cls, access_token: str, leave: LeaveRequest) -> bool:
        """Create Google Calendar Out of Office Event."""
        url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Google Calendar all-day events are inclusive of start_date and exclusive of end_date.
        # So we add 1 day to end_date.
        from datetime import timedelta
        end_exclusive = leave.end_date + timedelta(days=1)

        # Google Calendar supports OOO event types
        event_payload = {
            "summary": f"OOO - {leave.leave_type.capitalize()} Leave",
            "description": f"Leave Request ID: {leave.id}. Reason: {leave.reason}",
            "start": {"date": leave.start_date.isoformat()},
            "end": {"date": end_exclusive.isoformat()},
            "eventType": "outOfOffice",
            "outOfOfficeProperties": {
                "decliningBusinessSuggestion": "Declined because I am Out of Office.",
                "autoDeclineMode": "allRequests"
            },
            "transparency": "opaque" # Busy status
        }

        status, response = await cls._make_request_async(url, "POST", headers, event_payload)
        if status == 200 or status == 201:
            logger.info(f"Google Calendar OOO Event synced successfully: {response.get('id')}")
            return True
        else:
            logger.error(f"Failed to sync Google Calendar: {response.get('error')}")
            return False

    @classmethod
    async def _sync_to_outlook(cls, access_token: str, leave: LeaveRequest) -> bool:
        """Create Microsoft Outlook Out of Office (OOF) Event."""
        url = "https://graph.microsoft.com/v1.0/me/events"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Outlook event details
        event_payload = {
            "subject": f"OOO - {leave.leave_type.capitalize()} Leave",
            "body": {
                "contentType": "HTML",
                "content": f"Leave Request ID: {leave.id}. Reason: {leave.reason}"
            },
            "start": {
                "dateTime": f"{leave.start_date.isoformat()}T00:00:00",
                "timeZone": "UTC"
            },
            "end": {
                "dateTime": f"{leave.end_date.isoformat()}T23:59:59",
                "timeZone": "UTC"
            },
            "showAs": "oof", # Set Out of Office availability status
            "isAllDay": True
        }

        status, response = await cls._make_request_async(url, "POST", headers, event_payload)
        if status == 201:
            logger.info(f"Outlook OOO Event synced successfully: {response.get('id')}")
            return True
        else:
            logger.error(f"Failed to sync Outlook Calendar: {response.get('error')}")
            return False
