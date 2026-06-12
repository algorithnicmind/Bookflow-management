"""
E2E Test: test_admin_employee_flow.py
Scenario: Admin creates employee → New employee logs in → Applies for leave.
"""

import pytest
from datetime import date, timedelta
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_employee_flow(client: AsyncClient, seeded_db):
    admin_res = await client.post("/api/auth/login", data={"username": "admin@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    admin_headers = {"Authorization": f"Bearer {admin_res.json()['access_token']}"}

    # Step 1: Admin creates employee
    create_res = await client.post("/api/employees", headers=admin_headers, json={
        "name": "New Hire",
        "email": "newhire@company.com",
        "password": "password123",
        "role": "employee",
        "department": "Engineering"
    })
    assert create_res.status_code == 201

    # Step 2: New employee logs in
    emp_res = await client.post("/api/auth/login", data={"username": "newhire@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    assert emp_res.status_code == 200
    emp_headers = {"Authorization": f"Bearer {emp_res.json()['access_token']}"}

    # Step 3: Check balances exist
    bal_res = await client.get("/api/leaves/balance", headers=emp_headers)
    balances = bal_res.json()["balances"]
    assert len(balances) == 5

    # Step 4: Apply for leave
    tomorrow = date.today() + timedelta(days=1)
    apply_res = await client.post("/api/leaves", headers=emp_headers, json={
        "leave_type": "casual", "start_date": str(tomorrow), "end_date": str(tomorrow), "reason": "Test"
    })
    assert apply_res.status_code == 201
