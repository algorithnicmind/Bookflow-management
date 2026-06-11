from pydantic import BaseModel
from typing import Optional

class SettingsUpdate(BaseModel):
    max_casual_leave: Optional[int] = None
    max_sick_leave: Optional[int] = None
    max_earned_leave: Optional[int] = None
    max_maternity_leave: Optional[int] = None
    max_miscarriage_leave: Optional[int] = None

class SettingsResponse(BaseModel):
    message: str = "Settings updated successfully"
