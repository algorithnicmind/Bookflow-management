"""
Performance Test: test_dashboard_load.py
Simulates multiple concurrent dashboard stats requests (heavy aggregation queries).
"""

import pytest
import asyncio
import time
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_30_concurrent_dashboard_requests(client: AsyncClient, seeded_db):
    """Admin dashboard stats under load."""
    login_res = await client.post("/api/auth/login", data={"username": "john@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    headers = {"Authorization": f"Bearer {login_res.cookies.get("access_token")}"}
    
    async def get_dashboard():
        start = time.time()
        response = await client.get("/api/dashboard/stats", headers=headers)
        return response.status_code, time.time() - start
    
    results = await asyncio.gather(*[get_dashboard() for _ in range(30)])
    
    statuses = [r[0] for r in results]
    times = [r[1] for r in results]
    
    assert all(s == 200 for s in statuses)
    assert sum(times) / len(times) < 1.0  # Avg < 1s

@pytest.mark.asyncio
async def test_admin_dashboard_heavy_load(client: AsyncClient, seeded_db):
    """
    20 concurrent admin dashboard requests. Admin dashboard aggregates stats across all users.
    """
    login_res = await client.post("/api/auth/login", data={"username": "admin@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    headers = {"Authorization": f"Bearer {login_res.cookies.get("access_token")}"}
    
    async def get_admin_dashboard():
        start = time.time()
        response = await client.get("/api/dashboard/stats", headers=headers) # Assuming same endpoint handles admin role logic
        return response.status_code, time.time() - start
    
    results = await asyncio.gather(*[get_admin_dashboard() for _ in range(20)])
    
    statuses = [r[0] for r in results]
    times = [r[1] for r in results]
    
    assert all(s == 200 for s in statuses)
    assert sum(times) / len(times) < 2.0  # Avg < 2s

@pytest.mark.asyncio
async def test_dashboard_with_large_dataset(client: AsyncClient, seeded_db):
    """
    Simulating dashboard load for a large dataset.
    We just run 5 concurrent requests expecting it to be slightly slower but stable.
    """
    login_res = await client.post("/api/auth/login", data={"username": "admin@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    headers = {"Authorization": f"Bearer {login_res.cookies.get("access_token")}"}
    
    async def get_dashboard():
        start = time.time()
        response = await client.get("/api/dashboard/stats", headers=headers)
        return response.status_code, time.time() - start
    
    results = await asyncio.gather(*[get_dashboard() for _ in range(5)])
    
    statuses = [r[0] for r in results]
    times = [r[1] for r in results]
    
    assert all(s == 200 for s in statuses)
    assert sum(times) / len(times) < 3.0  # Avg < 3s
