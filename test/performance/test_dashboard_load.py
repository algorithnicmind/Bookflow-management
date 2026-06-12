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
    login_res = await client.post("/api/auth/login", data={"username": "admin@company.com", "password": "password123"}, headers={"Content-Type": "application/x-www-form-urlencoded"})
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}
    
    async def get_dashboard():
        start = time.time()
        response = await client.get("/api/dashboard/stats", headers=headers)
        return response.status_code, time.time() - start
    
    results = await asyncio.gather(*[get_dashboard() for _ in range(30)])
    
    statuses = [r[0] for r in results]
    times = [r[1] for r in results]
    
    assert all(s == 200 for s in statuses)
    assert sum(times) / len(times) < 1.0  # Avg < 1s
