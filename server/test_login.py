import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        resp = await client.get("http://127.0.0.1:8000/")
        print("Root:", resp.status_code)
        
        resp = await client.post("http://127.0.0.1:8000/api/auth/login", data={
            "username": "owner@leaveflow.com",
            "password": "Owner@123!"
        }, timeout=5.0)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("Login successful:", resp.json())
        else:
            print("Login failed:", resp.text)

asyncio.run(test())
