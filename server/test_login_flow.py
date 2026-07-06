import asyncio, sys
from app.core.database import AsyncSessionLocal
from app.core.security import pwd_context
from sqlalchemy import text
from app.modules.auth.repositories import AuthRepository

async def test():
    db = AsyncSessionLocal()
    repo = AuthRepository(db)
    
    # Test all users
    emails = [
        "ankitsahoo00000@gmail.com",
        "admin@leaveflow.com",
        "pragyanparamitamaharana@gmail.com",
    ]
    
    for email in emails:
        # Try employee first, then platform owner
        user = await repo.get_employee_by_email(email)
        if not user:
            user = await repo.get_platform_owner_by_email(email)
        
        if not user:
            print(f"{email}: NOT FOUND")
            continue
        
        print(f"{email}: found as {type(user).__name__}, role={user.role}, has_hash={user.password_hash is not None}")
        if user.password_hash:
            print(f"  Hash starts with: {user.password_hash[:20]}...")
            # Try common passwords
            for pwd in ["Owner@123!", "admin123", "password", "Pass@1234"]:
                try:
                    valid = pwd_context.verify(pwd, user.password_hash)
                    if valid:
                        print(f"  *** MATCHED password: {pwd}")
                except Exception as e:
                    print(f"  ERROR verifying '{pwd}': {type(e).__name__}: {e}")

    await db.close()

asyncio.run(test())
