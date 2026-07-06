"""
Performance Test: test_leave_apply_load.py
Simulates concurrent leave applications to test overlap checking and balance locks.
"""

import pytest
import asyncio
import os
from datetime import date, timedelta
from httpx import AsyncClient

# SQLite doesn't support concurrent writes, skip concurrency tests when using it
_SKIP_CONCURRENT = os.environ.get("TEST_DATABASE_URL", "").startswith("sqlite")
_skip_concurrent_reason = "Skipping concurrent test under SQLite (no concurrent write support)"

@pytest.mark.skipif(_SKIP_CONCURRENT, reason=_skip_concurrent_reason)
@pytest.mark.asyncio
async def test_balance_consistency_under_load(client: AsyncClient, seeded_db):
    """
    Apply 10 leaves concurrently to verify DB transaction isolation and balance calculation.
    """
    login_res = await client.post("/api/auth/login", data={"username": "john@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = login_res.cookies.get("access_token")
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
    
    # Run concurrently with 10 leaves
    results = await asyncio.gather(*[apply_leave(i) for i in range(10)])
    
    successes = sum(1 for r in results if r.status_code == 201)
    
    # Verify final balance
    bal_res2 = await client.get("/api/leaves/balance", headers=headers)
    final_casual = next(b["remaining"] for b in bal_res2.json()["balances"] if b["leave_type"] == "casual")
    
    expected = initial_casual - (successes * 2)
    assert final_casual == expected, f"Balance mismatch! Expected {expected}, got {final_casual}"

@pytest.mark.skipif(_SKIP_CONCURRENT, reason=_skip_concurrent_reason)
@pytest.mark.asyncio
async def test_20_concurrent_leave_applications(client: AsyncClient, seeded_db):
    """
    20 users applying for leave at the same time to ensure no deadlocks or errors.
    """
    # Use the seeded employee to apply leaves on different dates
    login_res = await client.post("/api/auth/login", data={"username": "john@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = login_res.cookies.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    tomorrow = date.today() + timedelta(days=100) # Far in future

    async def apply_leave(idx):
        start = tomorrow + timedelta(days=idx * 5)
        return await client.post("/api/leaves", headers=headers, json={
            "leave_type": "sick",
            "start_date": str(start),
            "end_date": str(start), # 1 day each
            "reason": f"Bulk Load test {idx}"
        })
    
    results = await asyncio.gather(*[apply_leave(i) for i in range(20)])
    
    # They should either succeed or fail gracefully (e.g. out of balance), but no 500 errors
    for r in results:
        assert r.status_code in (201, 400), f"Unexpected error during concurrent apply: {r.status_code}"

@pytest.mark.skipif(_SKIP_CONCURRENT, reason=_skip_concurrent_reason)
@pytest.mark.asyncio
async def test_same_user_concurrent_apply(client: AsyncClient, seeded_db):
    """
    5 concurrent identical leave applications by the SAME user.
    Only 1 should succeed, rest should hit overlap errors to prevent race conditions.
    """
    login_res = await client.post("/api/auth/login", data={"username": "john@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = login_res.cookies.get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    target_date = date.today() + timedelta(days=50) # Target a free date
    
    async def apply_identical_leave():
        return await client.post("/api/leaves", headers=headers, json={
            "leave_type": "casual",
            "start_date": str(target_date),
            "end_date": str(target_date),
            "reason": "Trying to cheat the system"
        })
    
    results = await asyncio.gather(*[apply_identical_leave() for _ in range(5)])
    
    successes = sum(1 for r in results if r.status_code == 201)
    failures = sum(1 for r in results if r.status_code == 400)
    
    assert successes <= 1, "Race condition vulnerability! Multiple identical overlapping leaves were created."
    assert failures >= 4, "Overlap errors were not triggered for concurrent duplicate requests."
