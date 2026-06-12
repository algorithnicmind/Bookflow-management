"""
Factory functions for creating test SystemSetting objects.
"""

from app.modules.settings.models import SystemSetting


def build_system_setting(
    max_casual_leave: int = 12,
    max_sick_leave: int = 12,
    max_earned_leave: int = 18,
    max_maternity_leave: int = 182,
    max_miscarriage_leave: int = 42,
) -> SystemSetting:
    """Build a SystemSetting object."""
    return SystemSetting(
        max_casual_leave=max_casual_leave,
        max_sick_leave=max_sick_leave,
        max_earned_leave=max_earned_leave,
        max_maternity_leave=max_maternity_leave,
        max_miscarriage_leave=max_miscarriage_leave,
    )
