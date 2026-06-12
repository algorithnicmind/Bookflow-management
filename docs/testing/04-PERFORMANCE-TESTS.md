# ⚡ Performance Tests — Detailed Plan

Performance tests verify that your system handles **concurrent users**, **high request volumes**, and **database load** without degradation. Run these before production deployments.

---

## 📌 What Is a Performance Test?

- Simulates **multiple concurrent users** hitting the API simultaneously
- Measures **response time**, **throughput**, and **error rates**
- Identifies **bottlenecks** in your database queries, middleware, or service logic
- Uses tools like `pytest` + `asyncio.gather`, or dedicated tools like `locust` / `k6`

---

## 🛠️ Tools

| Tool | Use Case | Install |
|------|----------|---------|
| **pytest + asyncio.gather** | Quick in-process load tests (good for CI) | Already installed |
| **Locust** | Full-featured load testing with web UI | `pip install locust` |
| **k6** | High-performance CLI-based load testing | Download from k6.io |

For this project, we recommend starting with **pytest + asyncio.gather** for CI integration, then using **Locust** for pre-production benchmarking.

---

## 1. `test_login_load.py` — Concurrent Login Requests

### Scenario
Simulate 50 users logging in simultaneously.

| Test ID | Test Name | Concurrent Users | Target | Expected |
|---------|-----------|:----------------:|--------|----------|
| P-LOGIN-001 | `test_50_concurrent_logins` | 50 | `POST /api/auth/login` | All succeed (200), avg response < 500ms |
| P-LOGIN-002 | `test_100_concurrent_logins` | 100 | `POST /api/auth/login` | All succeed (200), avg response < 1s |
| P-LOGIN-003 | `test_login_with_wrong_passwords` | 50 | Mixed valid/invalid | No server crash, all return 200 or 401 |

### Sample Test Code:
```python
# test/performance/test_login_load.py

import pytest
import asyncio
import time
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_50_concurrent_logins(client: AsyncClient, seeded_db):
    """50 users should be able to login simultaneously under 500ms average."""
    
    async def single_login():
        start = time.time()
        response = await client.post(
            "/api/auth/login",
            data={"username": "john@company.com", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        elapsed = time.time() - start
        return response.status_code, elapsed
    
    results = await asyncio.gather(*[single_login() for _ in range(50)])
    
    statuses = [r[0] for r in results]
    times = [r[1] for r in results]
    
    # All should succeed
    assert all(s == 200 for s in statuses), f"Some logins failed: {statuses}"
    
    # Average response time should be under 500ms
    avg_time = sum(times) / len(times)
    assert avg_time < 0.5, f"Average login time too slow: {avg_time:.3f}s"
    
    # Max response time should be under 2s
    max_time = max(times)
    assert max_time < 2.0, f"Max login time too slow: {max_time:.3f}s"
    
    print(f"\n📊 Login Load Test Results:")
    print(f"   Requests: {len(results)}")
    print(f"   Success:  {sum(1 for s in statuses if s == 200)}")
    print(f"   Avg Time: {avg_time:.3f}s")
    print(f"   Max Time: {max_time:.3f}s")
    print(f"   Min Time: {min(times):.3f}s")
```

### Metrics to Track:
| Metric | Threshold | What It Tells You |
|--------|:---------:|-------------------|
| Average response time | < 500ms | General API health |
| P95 response time | < 1s | Worst-case user experience |
| Max response time | < 2s | Potential timeout risk |
| Error rate | 0% | System stability |

---

## 2. `test_leave_apply_load.py` — Concurrent Leave Applications

### Scenario
Multiple employees applying for leaves at the same time — tests database locking, balance deduction, and overlap detection under concurrency.

| Test ID | Test Name | Concurrent Users | Target | Expected |
|---------|-----------|:----------------:|--------|----------|
| P-LEAVE-001 | `test_20_concurrent_leave_applications` | 20 | `POST /api/leaves` | All succeed or fail with correct errors, no DB corruption |
| P-LEAVE-002 | `test_same_user_concurrent_apply` | 5 (same user) | `POST /api/leaves` | At most 1 succeeds, rest get overlap error |
| P-LEAVE-003 | `test_balance_consistency_under_load` | 10 | Apply + check balance | Final balance == initial - (successful applies × days) |

### Key Concerns:
- **Race condition**: Two users applying for the same dates — overlap check must catch both
- **Balance corruption**: If two requests deduct simultaneously, `used_days` could go negative or exceed total
- **Deadlocks**: Multiple transactions locking the same `leave_balances` row

### Sample Test Code:
```python
# test/performance/test_leave_apply_load.py

import pytest
import asyncio
from datetime import date, timedelta
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_balance_consistency_under_load(client: AsyncClient, seeded_db):
    """
    10 concurrent leave applications by the same user.
    Only the first should succeed (others should fail with overlap error).
    Balance must remain consistent.
    """
    # Login as employee
    login_res = await client.post("/api/auth/login", data={
        "username": "john@company.com", "password": "password123"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check initial balance
    bal_res = await client.get("/api/leaves/balance", headers=headers)
    initial = {b["leave_type"]: b["remaining"] for b in bal_res.json()["balances"]}
    
    tomorrow = date.today() + timedelta(days=1)
    
    async def apply_leave(day_offset):
        start = tomorrow + timedelta(days=day_offset * 5)
        end = start + timedelta(days=1)
        return await client.post("/api/leaves", headers=headers, json={
            "leave_type": "casual",
            "start_date": str(start),
            "end_date": str(end),
            "reason": f"Load test #{day_offset}"
        })
    
    # Apply 10 leaves with different dates to avoid overlap issues
    results = await asyncio.gather(*[apply_leave(i) for i in range(10)])
    
    successes = sum(1 for r in results if r.status_code == 201)
    failures = sum(1 for r in results if r.status_code != 201)
    
    # Check final balance
    bal_res2 = await client.get("/api/leaves/balance", headers=headers)
    final = {b["leave_type"]: b["remaining"] for b in bal_res2.json()["balances"]}
    
    # Balance should be exactly: initial - (successes × 2 days each)
    expected_remaining = initial["casual"] - (successes * 2)
    assert final["casual"] == expected_remaining, \
        f"Balance inconsistency! Expected {expected_remaining}, got {final['casual']}"
    
    print(f"\n📊 Leave Apply Load Test:")
    print(f"   Concurrent: 10 | Success: {successes} | Failed: {failures}")
    print(f"   Balance: {initial['casual']} → {final['casual']}")
```

---

## 3. `test_dashboard_load.py` — Dashboard Stats Under Load

### Scenario
Dashboard stats involve multiple DB queries (joins, aggregations). Test how it performs with many concurrent requests.

| Test ID | Test Name | Concurrent Users | Target | Expected |
|---------|-----------|:----------------:|--------|----------|
| P-DASH-001 | `test_30_concurrent_dashboard_requests` | 30 | `GET /api/dashboard/stats` | All succeed (200), avg < 1s |
| P-DASH-002 | `test_admin_dashboard_heavy_load` | 20 | Admin dashboard (has org_stats) | All succeed, avg < 2s |
| P-DASH-003 | `test_dashboard_with_large_dataset` | 5 | After seeding 500 employees | All succeed, avg < 3s |

---

## 4. `test_employee_list_load.py` — Employee List with Large Dataset

### Scenario
Admin lists all employees when the database has hundreds of records.

| Test ID | Test Name | Dataset Size | Expected |
|---------|-----------|:-----------:|----------|
| P-EMP-001 | `test_list_100_employees` | 100 employees | < 500ms |
| P-EMP-002 | `test_list_500_employees` | 500 employees | < 2s |
| P-EMP-003 | `test_search_in_500_employees` | 500 employees, search="eng" | < 1s |

---

## 📊 Performance Test Summary

| Test Area | Test Count | Key Metric |
|-----------|:---------:|------------|
| Login Load | 3 | Response time < 500ms for 50 concurrent |
| Leave Apply Load | 3 | Balance consistency under concurrency |
| Dashboard Load | 3 | Aggregation query performance |
| Employee List Load | 3 | Large dataset pagination speed |
| **TOTAL** | **12** | — |

---

## 🎯 Performance Benchmarks (Targets)

| Metric | Development | Staging | Production |
|--------|:----------:|:-------:|:----------:|
| Avg response time | < 500ms | < 300ms | < 200ms |
| P95 response time | < 2s | < 1s | < 500ms |
| Max concurrent users | 50 | 200 | 500 |
| Error rate | < 5% | < 1% | 0% |
| Database query time | < 200ms | < 100ms | < 50ms |

---

## 🧪 Locust Configuration (Optional Advanced)

If you want to run more realistic load tests with a web dashboard:

```python
# test/performance/locustfile.py

from locust import HttpUser, task, between

class LeaveflowUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        """Login on start."""
        response = self.client.post("/api/auth/login", data={
            "username": "john@company.com",
            "password": "password123"
        }, headers={"Content-Type": "application/x-www-form-urlencoded"})
        self.token = response.json()["access_token"]

    @task(3)
    def view_dashboard(self):
        self.client.get("/api/dashboard/stats",
            headers={"Authorization": f"Bearer {self.token}"})

    @task(2)
    def view_balance(self):
        self.client.get("/api/leaves/balance",
            headers={"Authorization": f"Bearer {self.token}"})

    @task(1)
    def view_history(self):
        self.client.get("/api/leaves",
            headers={"Authorization": f"Bearer {self.token}"})
```

Run with:
```bash
cd server
locust -f test/performance/locustfile.py --host=http://localhost:8000
# Open http://localhost:8089 for the web UI
```

---

> **Next:** Proceed to [05-FRONTEND-TESTS.md](./05-FRONTEND-TESTS.md) for client-side testing.
