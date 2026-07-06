"""
E2E Test: test_employee_leave_flow.py
Scenario: Employee applies for leave → Manager approves it → Employee's balance and history reflect the change.
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_full_leave_approval_flow(client: AsyncClient, seeded_db):
    # Step 1: Employee logs in
    login_res = await client.post("/api/auth/login", data={
        "username": "john@company.com", "password": "password123"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    assert login_res.status_code == 200
    emp_token = login_res.cookies.get("access_token")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # Step 2: Check initial balance
    bal_res = await client.get("/api/leaves/balance", headers=emp_headers)
    initial_balances = {b["leave_type"]: b for b in bal_res.json()["balances"]}
    initial_casual_remaining = initial_balances["casual"]["remaining"]

    # Step 3: Apply for 3-day casual leave
    tomorrow = date.today() + timedelta(days=1)
    end_date = tomorrow + timedelta(days=2)
    apply_res = await client.post("/api/leaves", headers=emp_headers, json={
        "leave_type": "casual",
        "start_date": str(tomorrow),
        "end_date": str(end_date),
        "reason": "Family trip"
    })
    assert apply_res.status_code == 201

    # Step 4: Verify balance deducted immediately
    bal_res2 = await client.get("/api/leaves/balance", headers=emp_headers)
    new_balances = {b["leave_type"]: b for b in bal_res2.json()["balances"]}
    assert new_balances["casual"]["remaining"] == initial_casual_remaining - 3

    # Step 5: Get leave ID from pending history
    hist_res = await client.get("/api/leaves?status=pending", headers=emp_headers)
    pending_leaves = hist_res.json()["leaves"]
    assert len(pending_leaves) >= 1
    leave_id = pending_leaves[0]["id"]

    # Step 6: Manager logs in
    mgr_login = await client.post("/api/auth/login", data={
        "username": "alice@company.com", "password": "password123"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    mgr_token = mgr_login.cookies.get("access_token")
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

    # Step 7: Manager sees pending request in queue
    pending_res = await client.get("/api/leaves/pending", headers=mgr_headers)
    pending_ids = [p["id"] for p in pending_res.json()["pending"]]
    assert leave_id in pending_ids

    # Step 8: Manager approves
    approve_res = await client.put(
        f"/api/leaves/{leave_id}/approve",
        headers=mgr_headers,
        json={"comments": "Enjoy your trip!"}
    )
    assert approve_res.status_code == 200

    # Step 9: Employee checks history — now approved
    hist_res2 = await client.get("/api/leaves?status=approved", headers=emp_headers)
    approved = [l for l in hist_res2.json()["leaves"] if l["id"] == leave_id]
    assert len(approved) == 1
    assert approved[0]["status"] == "approved"
    assert approved[0]["approval"]["comments"] == "Enjoy your trip!"
    
    # Step 10: Check Notifications
    notif_res = await client.get("/api/notifications", headers=emp_headers)
    assert notif_res.status_code == 200
    assert any("approved" in n["title"].lower() for n in notif_res.json()["notifications"])
