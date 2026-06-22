"""
AI Chatbot Service
------------------
This module manages the conversational state machine for the AI Assistant.
It bridges the Gemini LLM (which extracts intent and entities from natural language)
with the application's backend business logic.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from bot.llm import LLMEngine
from bot.policies import get_policy
from bot.actions import get_balances_action, get_history_action, apply_leave_action
from datetime import datetime
from typing import Dict, Any, Optional

class ChatbotService:
    """
    Orchestrates the Chatbot State Machine.
    
    Architectural Flow:
    1. Receives raw user text and the persistent `session_state` dict (stored client-side or in DB).
    2. Passes the text and state to `LLMEngine.analyze_message` to extract 'intents' (e.g. apply_leave)
       and 'entities' (e.g. leave_type, start_date).
    3. Uses a rule-based State Machine below to process the intent. If it's a multi-turn process
       (like applying for leave), it stores missing entities in `session_state` and asks the user for them.
    4. Once all required entities are collected, it executes the backend DB action.
    """
    def __init__(self):
        self.llm = LLMEngine()

    async def handle_chat(self, message: str, session_state: Optional[Dict[str, Any]], employee_id: int, db: AsyncSession) -> Dict[str, Any]:
        """Orchestrate chatbot conversational flow and state management."""
        # Initialize state if not present
        if session_state is None:
            session_state = {}
            
        # Parse user message using the LLM or Mock Engine
        parsed_result = await self.llm.analyze_message(message, session_state)
        reply = parsed_result.get("reply", "I'm not sure how to respond to that.")
        entities = parsed_result.get("extracted_entities", {})
        intent = entities.get("intent", "general_chat")
        
        action_taken = None

        # 1. Handle Balance Intent
        if intent == "query_balance":
            action_res = await get_balances_action(db, employee_id)
            reply = action_res["message"]
            # Clear leave application step if they switched intent
            session_state.pop("step", None)
            session_state.pop("leave_data", None)

        # 2. Handle History Intent
        elif intent == "query_history":
            action_res = await get_history_action(db, employee_id)
            reply = action_res["message"]
            # Clear leave application step if they switched intent
            session_state.pop("step", None)
            session_state.pop("leave_data", None)

        # 3. Handle Policy Intent
        elif intent == "query_policy":
            topic = entities.get("policy_topic") or entities.get("leave_type") or "general"
            reply = get_policy(topic)
            # Clear leave application step if they switched intent
            session_state.pop("step", None)
            session_state.pop("leave_data", None)

        # 4. Handle Leave Application Flow
        elif intent == "apply_leave":
            # Initialize leave data dictionary in state
            if "leave_data" not in session_state:
                session_state["leave_data"] = {
                    "leave_type": None,
                    "start_date": None,
                    "end_date": None,
                    "reason": None
                }
            
            leave_data = session_state["leave_data"]
            
            # Merge newly extracted entities into state if they are provided
            for field in ["leave_type", "start_date", "end_date", "reason"]:
                if entities.get(field):
                    leave_data[field] = entities[field]
            
            # Determine the next step in the conversation flow
            if not leave_data.get("leave_type"):
                session_state["step"] = "awaiting_type"
                reply = "What type of leave do you want to apply for? (Options: sick, casual, earned, maternity, miscarriage, unpaid)"
            elif not leave_data.get("start_date"):
                session_state["step"] = "awaiting_start_date"
                reply = "Please specify the start date for your leave (YYYY-MM-DD format, e.g. 2026-06-25)."
            elif not leave_data.get("end_date"):
                session_state["step"] = "awaiting_end_date"
                reply = "Please specify the end date for your leave (YYYY-MM-DD format, e.g. 2026-06-26)."
            elif not leave_data.get("reason"):
                session_state["step"] = "awaiting_reason"
                reply = "What is the reason for this leave?"
            else:
                # All variables are collected. Handle confirmation.
                confirmation = entities.get("confirmation")
                
                if not confirmation:
                    session_state["step"] = "awaiting_confirm"
                    reply = (
                        f"I have prepared your request:\n"
                        f"- **Leave Type**: {leave_data['leave_type'].capitalize()}\n"
                        f"- **Start Date**: {leave_data['start_date']}\n"
                        f"- **End Date**: {leave_data['end_date']}\n"
                        f"- **Reason**: {leave_data['reason']}\n\n"
                        f"Shall I submit this leave request? (Reply 'Yes' or 'No')"
                    )
                elif confirmation == "yes":
                    # Execute database transaction
                    try:
                        # Parse date strings
                        s_date = datetime.strptime(leave_data['start_date'], "%Y-%m-%d").date()
                        e_date = datetime.strptime(leave_data['end_date'], "%Y-%m-%d").date()
                        
                        action_res = await apply_leave_action(
                            db,
                            employee_id,
                            leave_type=leave_data['leave_type'],
                            start_date=s_date,
                            end_date=e_date,
                            reason=leave_data['reason']
                        )
                        
                        reply = action_res["message"]
                        if action_res.get("success"):
                            action_taken = "leave_submitted"
                    except ValueError:
                        reply = "Oops! The dates you provided were not valid. Let's restart the application. What is the start date (YYYY-MM-DD)?"
                        leave_data['start_date'] = None
                        leave_data['end_date'] = None
                        session_state["step"] = "awaiting_start_date"
                        return {
                            "reply": reply,
                            "session_state": session_state,
                            "action_taken": action_taken
                        }
                    
                    # Clear session state on completion
                    session_state.pop("step", None)
                    session_state.pop("leave_data", None)
                else:
                    reply = "Leave application has been cancelled."
                    session_state.pop("step", None)
                    session_state.pop("leave_data", None)
                    
        return {
            "reply": reply,
            "session_state": session_state,
            "action_taken": action_taken
        }
