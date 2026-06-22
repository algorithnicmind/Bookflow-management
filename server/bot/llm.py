import os
import re
import json
import httpx
from datetime import datetime
from typing import Dict, Any, Optional

SYSTEM_PROMPT = """You are an intelligent HR Chatbot Assistant for the Leaveflow Management system.
Your goal is to help employees query leave balances, understand company policies, and apply for leaves conversationally.

You MUST respond in JSON format matching this schema:
{
  "reply": "A helpful, friendly, natural response to the user.",
  "extracted_entities": {
    "intent": "apply_leave" | "query_balance" | "query_history" | "query_policy" | "general_chat",
    "leave_type": "sick" | "casual" | "earned" | "maternity" | "miscarriage" | "unpaid" | null,
    "start_date": "YYYY-MM-DD" | null,
    "end_date": "YYYY-MM-DD" | null,
    "reason": "text reason" | null,
    "policy_topic": "sick" | "casual" | "earned" | "maternity" | "miscarriage" | "unpaid" | "general" | null,
    "confirmation": "yes" | "no" | null
  }
}

Guidelines:
1. If the user asks about leave policies, set intent to 'query_policy' and identify the leave_type in 'policy_topic'.
2. If the user wants to check their balance, set intent to 'query_balance'.
3. If they ask about past leaves, set intent to 'query_history'.
4. If they want to apply for leave:
   - Identify the intent as 'apply_leave'.
   - Extract 'leave_type', 'start_date', 'end_date', and 'reason' if mentioned.
   - If they specify dates like "tomorrow", "next Monday", calculate the absolute date in YYYY-MM-DD format (Today is: {today}).
5. If you are guiding them through a multi-step leave application:
   - Follow the session state context provided.
   - If they are confirming (e.g. "yes", "go ahead", "no", "cancel"), set 'confirmation' to 'yes' or 'no'.
"""

def extract_dates_from_text(text: str) -> Dict[str, Any]:
    """Fallback utility for extracting dates matching YYYY-MM-DD from text."""
    dates = re.findall(r"\b\d{4}-\d{2}-\d{2}\b", text)
    res = {}
    if len(dates) >= 1:
        res["start_date"] = dates[0]
    if len(dates) >= 2:
        res["end_date"] = dates[1]
    return res

class LLMEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-1.5-flash"
        
    def _run_mock_fallback(self, message: str, session_state: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """A rule-based NLP processor when no API Key is available."""
        q = message.lower().strip()
        entities = {
            "intent": "general_chat",
            "leave_type": None,
            "start_date": None,
            "end_date": None,
            "reason": None,
            "policy_topic": None,
            "confirmation": None
        }
        
        # Check active session context first
        if session_state and session_state.get("step"):
            step = session_state["step"]
            entities["intent"] = "apply_leave"
            
            if step == "awaiting_type":
                for lt in ["sick", "casual", "earned", "maternity", "miscarriage", "unpaid"]:
                    if lt in q:
                        entities["leave_type"] = lt
                        break
            elif step == "awaiting_start_date":
                dates = extract_dates_from_text(q)
                if "start_date" in dates:
                    entities["start_date"] = dates["start_date"]
            elif step == "awaiting_end_date":
                dates = extract_dates_from_text(q)
                if "start_date" in dates: # single date provided
                    entities["end_date"] = dates["start_date"]
            elif step == "awaiting_reason":
                if len(q) > 2:
                    entities["reason"] = message # Keep original casing
            elif step == "awaiting_confirm":
                if any(x in q for x in ["yes", "yep", "confirm", "ok", "sure", "approve"]):
                    entities["confirmation"] = "yes"
                elif any(x in q for x in ["no", "cancel", "stop"]):
                    entities["confirmation"] = "no"
            
            return {
                "reply": "Processing your response...",
                "extracted_entities": entities
            }
            
        # Regular intent detection
        if any(x in q for x in ["balance", "limit", "how many days", "remaining"]):
            entities["intent"] = "query_balance"
            for lt in ["sick", "casual", "earned", "maternity", "miscarriage", "unpaid"]:
                if lt in q:
                    entities["leave_type"] = lt
            reply = "Let me fetch your leave balances."
            
        elif any(x in q for x in ["history", "past", "status of", "previous", "recent"]):
            entities["intent"] = "query_history"
            reply = "Let me look up your recent leave history."
            
        elif "policy" in q or "rule" in q or "handbook" in q or "allowed" in q:
            entities["intent"] = "query_policy"
            reply = "Looking up the company policy..."
            for lt in ["sick", "casual", "earned", "maternity", "miscarriage", "unpaid"]:
                if lt in q:
                    entities["policy_topic"] = lt
            if not entities["policy_topic"]:
                entities["policy_topic"] = "general"
                
        elif any(x in q for x in ["apply", "request", "take leave", "take off", "book"]):
            entities["intent"] = "apply_leave"
            reply = "Sure, I can help you apply for leave."
            # Check if any details are in the original message
            for lt in ["sick", "casual", "earned", "maternity", "miscarriage", "unpaid"]:
                if lt in q:
                    entities["leave_type"] = lt
            
            # Simple date parsing fallback
            dates = extract_dates_from_text(q)
            if "start_date" in dates:
                entities["start_date"] = dates["start_date"]
            if "end_date" in dates:
                entities["end_date"] = dates["end_date"]
                
        else:
            entities["intent"] = "general_chat"
            reply = "Hello! I am your HR Assistant. You can ask me to check your leave balances, view your recent leave history, query company policies, or apply for leaves conversationally."
            
        return {
            "reply": reply,
            "extracted_entities": entities
        }

    async def analyze_message(self, message: str, session_state: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send message to Gemini for intent/entity parsing, falling back to mock rules if no key is set."""
        if not self.api_key:
            return self._run_mock_fallback(message, session_state)
            
        today_str = datetime.today().strftime("%Y-%m-%d (%A)")
        formatted_prompt = SYSTEM_PROMPT.format(today=today_str)
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        
        # Format the contents including context if available
        contents = []
        if session_state and "history" in session_state:
            # Add recent history entries if any
            for h in session_state["history"][-4:]:
                contents.append({"role": "user" if h["is_user"] else "model", "parts": [{"text": h["text"]}]})
                
        contents.append({"role": "user", "parts": [{"text": f"Context/State: {json.dumps(session_state or {})}\nUser Message: {message}"}]})
        
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": formatted_prompt}]
            },
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    response_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(response_text)
                    return parsed
                else:
                    # Log error details and fallback
                    return self._run_mock_fallback(message, session_state)
        except Exception:
            return self._run_mock_fallback(message, session_state)
