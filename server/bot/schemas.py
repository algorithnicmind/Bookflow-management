from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's chat message")
    session_state: Optional[Dict[str, Any]] = Field(default=None, description="State of the conversation for maintaining multi-turn context")

class ChatResponse(BaseModel):
    reply: str = Field(..., description="The text response from the chatbot")
    session_state: Optional[Dict[str, Any]] = Field(default=None, description="Updated conversation state")
    action_taken: Optional[str] = Field(default=None, description="Indicates if an action was executed (e.g., 'leave_submitted')")
