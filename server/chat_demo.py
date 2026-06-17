import asyncio
import os
import sys

# Add current folder to Python path
sys.path.append(os.path.dirname(__file__))

from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.modules.employees.models import Employee
from bot.service import ChatbotService

async def main():
    service = ChatbotService()
    async with AsyncSessionLocal() as db:
        # Fetch demo user
        result = await db.execute(select(Employee).where(Employee.email == "john@company.com"))
        user = result.scalar_one_or_none()
        if not user:
            from main import seed_demo_users
            await seed_demo_users()
            result = await db.execute(select(Employee).where(Employee.email == "john@company.com"))
            user = result.scalar_one_or_none()
            
        print("====================================================")
        print("      Leaveflow Chatbot Assistant (Interactive)     ")
        print(f"      Logged in as: {user.name} ({user.email})     ")
        print("      Type 'exit' or 'quit' to end the chat.        ")
        print("====================================================")
        
        session_state = {}
        
        # Initial hello
        res = await service.handle_chat("hello", session_state, user.id, db)
        print(f"\nBot: {res['reply']}")
        session_state = res["session_state"]
        
        while True:
            try:
                # Use standard terminal input
                user_msg = input("\nYou: ")
            except (KeyboardInterrupt, EOFError):
                print("\nEnding chat. Goodbye!")
                break
                
            if user_msg.lower().strip() in ["exit", "quit"]:
                print("Ending chat. Goodbye!")
                break
                
            if not user_msg.strip():
                continue
                
            res = await service.handle_chat(user_msg, session_state, user.id, db)
            print(f"\nBot: {res['reply']}")
            session_state = res["session_state"]

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"Error: {e}")
