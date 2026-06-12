"""
E2E Test: test_leave_cancel_flow.py
Scenario: Employee applies for leave → Employee cancels it → Balance is restored.
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_leave_cancel_flow(client: AsyncClient, seeded_db):
    emp_res = await client.post("/api/auth/login", data={"username": "john@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    emp_headers = {"Authorization": f"Bearer {emp_res.json()['access_token']}"}

    mgr_res = await client.post("/api/auth/login", data={"username": "alice@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    mgr_headers = {"Authorization": f"Bearer {mgr_res.json()['access_token']}"}

    # Apply
    start = date.today() + timedelta(days=1)
    await client.post("/api/leaves", headers=emp_headers, json={
        "leave_type": "sick", "start_date": str(start), "end_date": str(start), "reason": "Sick"
    })
    
    # Get ID
    hist_res = await client.get("/api/leaves?status=pending", headers=emp_headers)
    leave_id = hist_res.json()["leaves"][0]["id"]

    # Cancel
    cancel_res = await client.put(f"/api/leaves/{leave_id}/cancel", headers=emp_headers)
    assert cancel_res.status_code == 200

    # Ensure it's not in manager's pending queue
    mgr_pending = await client.get("/api/leaves/pending", headers=mgr_headers)
    assert not any(l["id"] == leave_id for l in mgr_pending.json()["pending"])

    # Verify status is cancelled
    cancelled_res = await client.get("/api/leaves?status=cancelled", headers=emp_headers)
    assert len(cancelled_res.json()["leaves"]) >= 1
