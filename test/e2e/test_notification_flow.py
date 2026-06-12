"""
E2E Test: test_notification_flow.py
Scenario: Employee applies → Manager gets notification → Reads it → Employee gets approval notification.
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_notification_flow(client: AsyncClient, seeded_db):
    emp_res = await client.post("/api/auth/login", data={"username": "john@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    emp_headers = {"Authorization": f"Bearer {emp_res.json()['access_token']}"}

    mgr_res = await client.post("/api/auth/login", data={"username": "alice@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    mgr_headers = {"Authorization": f"Bearer {mgr_res.json()['access_token']}"}

    # Step 1: Employee applies
    tomorrow = date.today() + timedelta(days=1)
    await client.post("/api/leaves", headers=emp_headers, json={"leave_type": "casual", "start_date": str(tomorrow), "end_date": str(tomorrow), "reason": "Test"})

    # Step 2: Manager checks notifications
    mgr_notifs = await client.get("/api/notifications", headers=mgr_headers)
    assert mgr_notifs.status_code == 200
    unread = [n for n in mgr_notifs.json()["notifications"] if not n["is_read"]]
    assert len(unread) >= 1
    notif_id = unread[0]["id"]

    # Step 3: Manager marks read
    await client.put(f"/api/notifications/{notif_id}/read", headers=mgr_headers)

    # Step 4: Manager approves leave
    pending_res = await client.get("/api/leaves/pending", headers=mgr_headers)
    leave_id = pending_res.json()["pending"][0]["id"]
    await client.put(f"/api/leaves/{leave_id}/approve", headers=mgr_headers, json={"comments": "OK"})

    # Step 5: Employee gets notification
    emp_notifs = await client.get("/api/notifications", headers=emp_headers)
    assert any("approved" in n["title"].lower() for n in emp_notifs.json()["notifications"])
