"""
Performance Test: test_employee_list_load.py
Simulates fetching and searching through large employee lists.
"""

import pytest
import time
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_100_employees(client: AsyncClient, seeded_db):
    """Admin listing 100 employees."""
    login_res = await client.post("/api/auth/login", data={"username": "admin@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    headers = {"Authorization": f"Bearer {login_res.cookies.get("access_token")}"}
    
    start = time.time()
    response = await client.get("/api/employees?limit=100", headers=headers)
    elapsed = time.time() - start
    
    assert response.status_code == 200
    assert elapsed < 0.5  # < 500ms

@pytest.mark.asyncio
async def test_list_500_employees(client: AsyncClient, seeded_db):
    """Admin listing 500 employees."""
    login_res = await client.post("/api/auth/login", data={"username": "admin@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    headers = {"Authorization": f"Bearer {login_res.cookies.get("access_token")}"}
    
    start = time.time()
    response = await client.get("/api/employees?limit=500", headers=headers)
    elapsed = time.time() - start
    
    assert response.status_code == 200
    assert elapsed < 2.0  # < 2s

@pytest.mark.asyncio
async def test_search_in_500_employees(client: AsyncClient, seeded_db):
    """Admin searching through a large dataset of 500 employees."""
    login_res = await client.post("/api/auth/login", data={"username": "admin@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    headers = {"Authorization": f"Bearer {login_res.cookies.get("access_token")}"}
    
    start = time.time()
    response = await client.get("/api/employees?search=eng&limit=500", headers=headers)
    elapsed = time.time() - start
    
    assert response.status_code == 200
    assert elapsed < 1.0  # < 1s
