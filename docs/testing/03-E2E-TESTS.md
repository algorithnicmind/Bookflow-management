# 🔄 End-to-End (E2E) Tests — Detailed Plan

E2E tests simulate **complete real-world user journeys** by chaining multiple API calls together. They verify that the entire system works as a cohesive whole — from login to final side-effects.

---

## 📌 What Is an E2E Test?

- Simulates a **full user workflow** across multiple endpoints
- Verifies **state transitions** across the entire system
- Checks that **side effects propagate correctly** (balances, notifications, statuses)
- Uses a real test database, just like integration tests
- Each test is **self-contained** — creates its own data, runs the flow, verifies outcomes

---

## 1. `test_employee_leave_flow.py` — The Core Happy Path ⭐

**Scenario:** An employee applies for leave → their manager approves it → the employee's balance and history reflect the change.

```
Employee Login → Apply Casual Leave (3 days) → Check Balance (deducted) →
Manager Login → See Pending Request → Approve → 
Employee checks history (status = approved) → Balance confirmed
```

### Test Steps

| Step | API Call | Auth | Assert |
|:----:|---------|------|--------|
| 1 | `POST /api/auth/login` | `john@company.com` | Get employee token, `role == "employee"` |
| 2 | `GET /api/leaves/balance` | Employee token | Note initial casual balance (e.g., 12 total, 0 used) |
| 3 | `POST /api/leaves` | Employee token | `leave_type: "casual"`, `start_date: tomorrow`, `end_date: tomorrow+2d`, `reason: "Family trip"` → Status `201` |
| 4 | `GET /api/leaves/balance` | Employee token | Casual `used_days` increased by 3, `remaining` decreased by 3 |
| 5 | `GET /api/leaves?status=pending` | Employee token | New leave appears with `status: "pending"` |
| 6 | `POST /api/auth/login` | `alice@company.com` | Get manager token, `role == "manager"` |
| 7 | `GET /api/leaves/pending` | Manager token | John's leave appears in pending list |
| 8 | `PUT /api/leaves/{id}/approve` | Manager token | `{comments: "Enjoy your trip!"}` → Status `200` |
| 9 | `GET /api/leaves?status=approved` | Employee token | Leave now has `status: "approved"`, `approval.manager_name: "Alice Manager"`, `approval.comments: "Enjoy your trip!"` |
| 10 | `GET /api/leaves/balance` | Employee token | Balance unchanged (deduction happened at apply time) |
| 11 | `GET /api/notifications` | Employee token | Has notification: "Your request ... has been approved" |

### Sample Test Code:
```python
# test/e2e/test_employee_leave_flow.py

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
    emp_token = login_res.json()["access_token"]
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

    # Step 4: Verify balance deducted
    bal_res2 = await client.get("/api/leaves/balance", headers=emp_headers)
    new_balances = {b["leave_type"]: b for b in bal_res2.json()["balances"]}
    assert new_balances["casual"]["remaining"] == initial_casual_remaining - 3

    # Step 5: Get leave ID from history
    hist_res = await client.get("/api/leaves?status=pending", headers=emp_headers)
    pending_leaves = hist_res.json()["leaves"]
    assert len(pending_leaves) >= 1
    leave_id = pending_leaves[0]["id"]

    # Step 6: Manager logs in
    mgr_login = await client.post("/api/auth/login", data={
        "username": "alice@company.com", "password": "password123"
    }, headers={"Content-Type": "application/x-www-form-urlencoded"})
    mgr_token = mgr_login.json()["access_token"]
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

    # Step 7: Manager sees pending request
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
```

---

## 2. `test_leave_rejection_flow.py` — Rejection & Balance Restoration

**Scenario:** Employee applies for leave → Manager rejects it → Balance is restored → Employee sees rejection reason.

```
Employee applies → Balance deducted → Manager rejects with reason → 
Balance restored → Employee sees "rejected" status with reason
```

### Test Steps

| Step | API Call | Assert |
|:----:|---------|--------|
| 1 | Employee login | Token obtained |
| 2 | Check initial balance | Note casual remaining |
| 3 | `POST /api/leaves` (casual, 2 days) | Status 201, balance deducted by 2 |
| 4 | Manager login | Token obtained |
| 5 | `PUT /api/leaves/{id}/reject` with `{comments: "Team is short-staffed this week"}` | Status 200 |
| 6 | Employee `GET /api/leaves/balance` | Casual remaining == initial (restored) |
| 7 | Employee `GET /api/leaves?status=rejected` | Leave shows `status: "rejected"`, `approval.comments: "Team is short-staffed..."` |
| 8 | Employee `GET /api/notifications` | Has notification with rejection reason |

### Key Assertions:
- **Balance is fully restored** after rejection
- **Rejection reason** appears in leave history
- **Notification** is sent to employee with the reason text

---

## 3. `test_leave_cancel_flow.py` — Self-Cancellation & Balance Restoration

**Scenario:** Employee applies for leave → Decides to cancel it → Balance is restored → Manager no longer sees it in pending.

```
Employee applies → Balance deducted → Employee cancels →
Balance restored → Manager's pending queue is empty
```

### Test Steps

| Step | API Call | Assert |
|:----:|---------|--------|
| 1 | Employee login | Token obtained |
| 2 | Check initial balance | Note sick remaining |
| 3 | `POST /api/leaves` (sick, 1 day) | Status 201, balance deducted by 1 |
| 4 | `PUT /api/leaves/{id}/cancel` | Status 200, `"Leave request cancelled successfully"` |
| 5 | `GET /api/leaves/balance` | Sick remaining == initial (restored) |
| 6 | `GET /api/leaves?status=cancelled` | Leave appears with `status: "cancelled"` |
| 7 | Manager login → `GET /api/leaves/pending` | Cancelled leave is NOT in pending list |

### Edge Case Assertions:
- Cannot cancel an **already approved** leave → `400`
- Cannot cancel **someone else's** leave → `403`

---

## 4. `test_admin_employee_flow.py` — Admin Creates Employee Who Then Uses System

**Scenario:** Admin creates a new employee → The new employee logs in → Applies for leave → Everything works.

```
Admin login → Create employee (John Jr, engineer, reports to Alice) →
New employee logs in → Has 5 leave balance types → Applies for leave →
Manager sees the pending request
```

### Test Steps

| Step | API Call | Assert |
|:----:|---------|--------|
| 1 | Admin login | Token obtained |
| 2 | `POST /api/employees` with `{name, email, password, role:"employee", department, manager_id}` | Status 201 |
| 3 | New employee login | Token obtained, `role == "employee"` |
| 4 | `GET /api/leaves/balance` | 5 leave types with default allocations: casual(12), sick(12), earned(18), maternity(182), miscarriage(42) |
| 5 | `POST /api/leaves` (casual, 1 day) | Status 201 |
| 6 | Manager login → `GET /api/leaves/pending` | New employee's leave appears |
| 7 | `GET /api/dashboard/stats` (new employee) | `stats.total_requests == 1`, `stats.pending == 1` |

### Key Assertions:
- Newly created employee has **correct leave balances**
- The manager hierarchy is **immediately active** — leave notification reaches the assigned manager
- Dashboard reflects **real-time data** for the new employee

---

## 5. `test_notification_flow.py` — Notification Lifecycle

**Scenario:** Verifies that notifications are created, listed, marked as read, and the count updates correctly.

```
Employee applies → Manager gets notification → Manager reads it →
Manager approves → Employee gets notification → Employee marks all read →
All notifications are read
```

### Test Steps

| Step | API Call | Auth | Assert |
|:----:|---------|------|--------|
| 1 | Employee applies for leave | Employee token | Status 201 |
| 2 | `GET /api/notifications` | Manager token | Has 1 unread notification: "New Leave Application" |
| 3 | `PUT /api/notifications/{id}/read` | Manager token | Status 200 |
| 4 | `GET /api/notifications` | Manager token | Notification now has `is_read: true` |
| 5 | Manager approves leave | Manager token | Status 200 |
| 6 | `GET /api/notifications` | Employee token | Has notification: "Leave Request Approved" |
| 7 | `PUT /api/notifications/read-all` | Employee token | Status 200 |
| 8 | `GET /api/notifications` | Employee token | All notifications have `is_read: true` |

### Key Assertions:
- Notifications are created **automatically** by the leave service
- `is_read` transitions from `false` → `true`
- `mark_all_read` only affects **the current user's** notifications

---

## 6. `test_super_admin_governance_flow.py` — Super Admin System Configuration

**Scenario:** Super Admin updates system settings → Creates a new admin → Views org reports.

```
Super Admin login → Update settings (max casual to 15) →
Register new admin → View organization report (counts updated) →
New admin login → Can manage employees
```

### Test Steps

| Step | API Call | Auth | Assert |
|:----:|---------|------|--------|
| 1 | Super Admin login | — | Token obtained, `role == "super_admin"` |
| 2 | `PUT /api/settings` `{max_casual_leave: 15}` | Super Admin | `200`, "Settings updated successfully" |
| 3 | `GET /api/settings` | Super Admin | `max_casual_leave == 15` |
| 4 | `POST /api/auth/register` `{name, email, password}` | Super Admin | `201`, admin created |
| 5 | `GET /api/reports/organization` | Super Admin | `total_admins` increased by 1 |
| 6 | New admin login | — | Token obtained, `role == "admin"` |
| 7 | `GET /api/employees` | New admin | `200`, employee list returned (admin has access) |

---

## 📋 Total E2E Test Count

| Test File | Scenarios | Steps |
|-----------|:---------:|:-----:|
| `test_employee_leave_flow.py` | 1 | 11 |
| `test_leave_rejection_flow.py` | 1 | 8 |
| `test_leave_cancel_flow.py` | 1 + 2 edge cases | 9 |
| `test_admin_employee_flow.py` | 1 | 7 |
| `test_notification_flow.py` | 1 | 8 |
| `test_super_admin_governance_flow.py` | 1 | 7 |
| **TOTAL** | **6 flows + 2 edge cases** | **~50 steps** |

---

## 🧠 Why These Flows Matter

| Flow | Business Risk It Covers |
|------|------------------------|
| Leave approval | **Primary revenue-critical path** — if this breaks, no one can take leave |
| Leave rejection | Balance must be restored — financial accuracy |
| Leave cancel | Self-service — employees must be able to undo mistakes |
| Admin creates employee | Onboarding — new hires must have working accounts immediately |
| Notifications | Communication — managers must be alerted to pending requests |
| Super admin governance | System configuration — settings must propagate correctly |

---

> **Next:** Proceed to [04-PERFORMANCE-TESTS.md](./04-PERFORMANCE-TESTS.md) for load testing.
