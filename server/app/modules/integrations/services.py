import os
import json
import logging
import urllib.request
import urllib.error
import asyncio

logger = logging.getLogger("integrations")

class IntegrationService:
    @staticmethod
    def _send_post_sync(url: str, payload: dict) -> bool:
        """Helper to send a synchronous POST request with JSON payload."""
        try:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                status = response.getcode()
                body = response.read().decode("utf-8")
                logger.info(f"Notification sent to {url}. Status: {status}, Response: {body}")
                return 200 <= status < 300
        except urllib.error.HTTPError as e:
            logger.error(f"HTTPError sending to {url}: {e.code} {e.reason} - {e.read().decode('utf-8')}")
            return False
        except Exception as e:
            logger.error(f"Error sending to {url}: {str(e)}")
            return False

    @classmethod
    async def _send_post_async(cls, url: str, payload: dict) -> bool:
        """Sends POST request in a separate thread to prevent blocking the event loop."""
        return await asyncio.to_thread(cls._send_post_sync, url, payload)

    @classmethod
    async def send_slack_leave_notification(
        cls,
        leave_id: int,
        employee_name: str,
        leave_type: str,
        start_date: str,
        end_date: str,
        reason: str
    ) -> bool:
        webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
        if not webhook_url or "mock/webhook" in webhook_url:
            logger.warning(f"Slack webhook URL not configured or mock. Skipping Slack notification for Leave ID {leave_id}")
            return False

        # Format message in Slack Block Kit
        payload = {
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Naya Leave Request Aaya Hai!*\n*Employee:* {employee_name}\n*Type:* {leave_type.capitalize()}\n*Dates:* {start_date} se {end_date}\n*Reason:* {reason}"
                    }
                },
                {
                    "type": "actions",
                    "block_id": f"leave_actions_{leave_id}",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Approve ✅"
                            },
                            "style": "primary",
                            "value": str(leave_id),
                            "action_id": "approve_leave"
                        },
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Reject ❌"
                            },
                            "style": "danger",
                            "value": str(leave_id),
                            "action_id": "reject_leave"
                        }
                    ]
                }
            ]
        }

        return await cls._send_post_async(webhook_url, payload)

    @classmethod
    async def send_teams_leave_notification(
        cls,
        leave_id: int,
        employee_name: str,
        leave_type: str,
        start_date: str,
        end_date: str,
        reason: str
    ) -> bool:
        webhook_url = os.environ.get("TEAMS_WEBHOOK_URL")
        if not webhook_url or "mock/webhook" in webhook_url:
            logger.warning(f"Teams webhook URL not configured or mock. Skipping Teams notification for Leave ID {leave_id}")
            return False

        # Format message in Microsoft Teams Adaptive Card
        payload = {
            "type": "message",
            "attachments": [
                {
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "content": {
                        "type": "AdaptiveCard",
                        "body": [
                            {
                                "type": "TextBlock",
                                "text": "Naya Leave Request",
                                "weight": "bolder",
                                "size": "medium"
                            },
                            {
                                "type": "FactSet",
                                "facts": [
                                    {"title": "Employee", "value": employee_name},
                                    {"title": "Type", "value": leave_type.capitalize()},
                                    {"title": "Dates", "value": f"{start_date} se {end_date}"},
                                    {"title": "Reason", "value": reason}
                                ]
                            }
                        ],
                        "actions": [
                            {
                                "type": "Action.Execute",
                                "title": "Approve ✅",
                                "verb": "approve_leave",
                                "data": {
                                    "leave_id": str(leave_id)
                                }
                            },
                            {
                                "type": "Action.Execute",
                                "title": "Reject ❌",
                                "verb": "reject_leave",
                                "data": {
                                    "leave_id": str(leave_id)
                                }
                            }
                        ],
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "version": "1.4"
                    }
                }
            ]
        }

        return await cls._send_post_async(webhook_url, payload)
