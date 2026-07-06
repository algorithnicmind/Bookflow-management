"""
E2E Test: test_leave_rejection_flow.py
Scenario: Employee applies for leave → Manager rejects it → Balance is restored.
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_leave_rejection_flow(client: AsyncClient, seeded_db):
    # Setup tokens
    emp_res = await client.post("/api/auth/login", data={"username": "john@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    emp_token = emp_res.cookies.get("access_token")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    mgr_res = await client.post("/api/auth/login", data={"username": "alice@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    mgr_token = mgr_res.cookies.get("access_token")
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

    # Step 1: Employee checks initial balance
    bal_res = await client.get("/api/leaves/balance", headers=emp_headers)
    initial_casual = next(b["remaining"] for b in bal_res.json()["balances"] if b["leave_type"] == "casual")

    # Step 2: Employee applies for leave
    tomorrow = date.today() + timedelta(days=1)
    apply_res = await client.post("/api/leaves", headers=emp_headers, json={
        "leave_type": "casual", "start_date": str(tomorrow), "end_date": str(tomorrow), "reason": "Test"
    })
    assert apply_res.status_code == 201

    # Get Leave ID
    hist_res = await client.get("/api/leaves?status=pending", headers=emp_headers)
    leave_id = hist_res.json()["leaves"][0]["id"]

    # Step 3: Manager rejects
    reject_res = await client.put(f"/api/leaves/{leave_id}/reject", headers=mgr_headers, json={"comments": "Busy time"})
    assert reject_res.status_code == 200

    # Step 4: Verify Balance is restored
    bal_res2 = await client.get("/api/leaves/balance", headers=emp_headers)
    restored_casual = next(b["remaining"] for b in bal_res2.json()["balances"] if b["leave_type"] == "casual")
    assert restored_casual == initial_casual

    # Step 5: Check rejection reason is visible to employee
    hist_res2 = await client.get("/api/leaves?status=rejected", headers=emp_headers)
    rejected_leave = hist_res2.json()["leaves"][0]
    assert rejected_leave["approval"]["comments"] == "Busy time"
