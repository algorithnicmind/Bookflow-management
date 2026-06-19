"""
Performance Test: test_login_load.py
Simulates multiple concurrent logins to test authentication performance.
"""

import pytest
import asyncio
import time
import random
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_50_concurrent_logins(client: AsyncClient, seeded_db):
    """50 users should be able to login simultaneously under 1s average."""
    
    async def single_login():
        start = time.time()
        response = await client.post(
            "/api/auth/login",
            data={"username": "john@company.com", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        elapsed = time.time() - start
        return response.status_code, elapsed
    
    # Run 50 concurrent login requests
    results = await asyncio.gather(*[single_login() for _ in range(50)])
    
    statuses = [r[0] for r in results]
    times = [r[1] for r in results]
    
    # Assertions
    assert all(s == 200 for s in statuses), f"Some logins failed. Statuses: {statuses}"
    avg_time = sum(times) / len(times)
    
    # Performance threshold assertions
    assert avg_time < 1.0, f"Average login time too slow: {avg_time:.3f}s"
    assert max(times) < 3.0, f"Max login time too slow: {max(times):.3f}s"

@pytest.mark.asyncio
async def test_100_concurrent_logins(client: AsyncClient, seeded_db):
    """100 users should be able to login simultaneously under 1s average."""
    
    async def single_login():
        start = time.time()
        response = await client.post(
            "/api/auth/login",
            data={"username": "jane@company.com", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        elapsed = time.time() - start
        return response.status_code, elapsed
    
    results = await asyncio.gather(*[single_login() for _ in range(100)])
    
    statuses = [r[0] for r in results]
    times = [r[1] for r in results]
    
    assert all(s == 200 for s in statuses), f"Some logins failed. Statuses: {statuses}"
    avg_time = sum(times) / len(times)
    
    assert avg_time < 1.0, f"Average login time too slow: {avg_time:.3f}s"
    assert max(times) < 5.0, f"Max login time too slow: {max(times):.3f}s"

@pytest.mark.asyncio
async def test_login_with_wrong_passwords(client: AsyncClient, seeded_db):
    """50 concurrent login attempts with mixed valid/invalid credentials."""
    
    async def single_login(valid: bool):
        start = time.time()
        password = "password123" if valid else "wrongpass"
        response = await client.post(
            "/api/auth/login",
            data={"username": "john@company.com", "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        elapsed = time.time() - start
        return response.status_code, elapsed
    
    # Generate 50 requests, ~50% valid
    requests = [single_login(random.choice([True, False])) for _ in range(50)]
    results = await asyncio.gather(*requests)
    
    statuses = [r[0] for r in results]
    
    # No 500 errors should occur, only 200 and 401
    for status in statuses:
        assert status in (200, 401), f"Unexpected status code: {status}"
