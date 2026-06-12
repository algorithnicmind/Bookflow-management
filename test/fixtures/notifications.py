"""
Factory functions for creating test Notification objects.
"""

from app.modules.notifications.models import Notification


def build_notification(
    user_id: int = 1,
    title: str = "Test Notification",
    message: str = "This is a test notification",
    ntype: str = "info",
    is_read: bool = False,
    action_url: str = None,
) -> Notification:
    """Build a Notification object."""
    return Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=ntype,
        is_read=is_read,
        action_url=action_url,
    )
