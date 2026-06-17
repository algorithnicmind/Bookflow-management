from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.employees.models import Employee
from bot.schemas import ChatRequest, ChatResponse
from bot.service import ChatbotService

router = APIRouter(prefix="/api/bot", tags=["bot"])

chatbot_service = ChatbotService()

@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_bot(
    request: ChatRequest,
    current_user: Employee = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Secure endpoint to interact with the AI Chatbot Assistant."""
    result = await chatbot_service.handle_chat(
        message=request.message,
        session_state=request.session_state,
        employee_id=current_user.id,
        db=db
    )
    return ChatResponse(
        reply=result["reply"],
        session_state=result["session_state"],
        action_taken=result["action_taken"]
    )
