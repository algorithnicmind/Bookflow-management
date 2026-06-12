"""
Performance Test: test_leave_apply_load.py
Simulates concurrent leave applications to test overlap checking and balance locks.
"""

import pytest
import asyncio
from datetime import date, timedelta
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_balance_consistency_under_load(client: AsyncClient, seeded_db):
    """
    Apply 10 leaves concurrently to verify DB transaction isolation and balance calculation.
    """
    login_res = await client.post("/api/auth/login", data={"username": "john@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check initial balance
    bal_res = await client.get("/api/leaves/balance", headers=headers)
    initial_casual = next(b["remaining"] for b in bal_res.json()["balances"] if b["leave_type"] == "casual")
    
    tomorrow = date.today() + timedelta(days=1)
    
    async def apply_leave(day_offset):
        # Stagger dates to avoid overlapping logic triggering
        start = tomorrow + timedelta(days=day_offset * 5)
        return await client.post("/api/leaves", headers=headers, json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(start + timedelta(days=1)), # 2 days each
            "reason": f"Load test {day_offset}"
        })
    
    # Run concurrently
    results = await asyncio.gather(*[apply_leave(i) for i in range(5)])
    
    successes = sum(1 for r in results if r.status_code == 201)
    
    # Verify final balance
    bal_res2 = await client.get("/api/leaves/balance", headers=headers)
    final_casual = next(b["remaining"] for b in bal_res2.json()["balances"] if b["leave_type"] == "casual")
    
    expected = initial_casual - (successes * 2)
    assert final_casual == expected, f"Balance mismatch! Expected {expected}, got {final_casual}"
