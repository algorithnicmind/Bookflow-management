# 🔗 Integration Tests — Detailed Plan

Integration tests call your **real API endpoints** through FastAPI's `TestClient` (using `httpx.AsyncClient`) and hit a **real test database** (SQLite in-memory or a separate PostgreSQL). They verify that routes, services, repositories, and the database all work together correctly.

---

## 📌 What Is an Integration Test?

- Tests a **complete HTTP request → response** cycle
- Uses a real (test) database — tables are created and torn down per test
- Validates **HTTP status codes**, **response JSON structure**, and **side effects** (DB state changes)
- Includes **authentication** — tests generate real JWT tokens

---

## 🛠️ Test Setup

Every integration test file should:
1. Use the async test client from `conftest.py`
2. Create test users using fixture factories
3. Generate valid JWT tokens for authentication
4. Assert both the **response** and the **database state**

```python
# Example: How every integration test will look
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_example(client: AsyncClient, employee_token: str):
    response = await client.get(
        "/api/leaves/balance",
        headers={"Authorization": f"Bearer {employee_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "balances" in data
```

---

## 1. Auth Module — `test/integration/auth/`

### 1.1 `test_login.py` — `POST /api/auth/login`

| Test ID | Test Name | Request | Expected Status | Expected Response |
|---------|-----------|---------|:--------------:|-------------------|
| I-AUTH-001 | `test_login_success_employee` | `username=john@company.com, password=password123` | `200` | `access_token` present, `user.role == "employee"` |
| I-AUTH-002 | `test_login_success_manager` | `username=alice@company.com, password=password123` | `200` | `user.role == "manager"` |
| I-AUTH-003 | `test_login_success_admin` | `username=admin@company.com, password=password123` | `200` | `user.role == "admin"` |
| I-AUTH-004 | `test_login_wrong_password` | `username=john@company.com, password=wrong` | `401` | `detail: "Invalid email or password"` |
| I-AUTH-005 | `test_login_nonexistent_email` | `username=ghost@company.com, password=any` | `401` | `detail: "Invalid email or password"` |
| I-AUTH-006 | `test_login_deactivated_user` | Deactivated user's credentials | `403` | `detail: "Account is deactivated"` |
| I-AUTH-007 | `test_login_returns_user_object` | Valid login | `200` | Response has `user.id`, `user.name`, `user.email`, `user.role`, `user.department` |
| I-AUTH-008 | `test_login_token_is_valid_jwt` | Valid login | `200` | Token can be decoded with the test JWT secret |

#### Sample Test Code:
```python
# test/integration/auth/test_login.py

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success_employee(client: AsyncClient, seeded_db):
    response = await client.post(
        "/api/auth/login",
        data={"username": "john@company.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "employee"
    assert data["user"]["email"] == "john@company.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, seeded_db):
    response = await client.post(
        "/api/auth/login",
        data={"username": "john@company.com", "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]
```

---

### 1.2 `test_register.py` — `POST /api/auth/register`

| Test ID | Test Name | Auth | Request Body | Expected Status | Expected Response | DB Side Effect |
|---------|-----------|------|-------------|:--------------:|-------------------|----------------|
| I-AUTH-009 | `test_register_admin_success` | Super Admin token | `{name, email, password, gender}` | `201` | `"Admin registered successfully"` | New Employee with `role="admin"` created + 5 LeaveBalances |
| I-AUTH-010 | `test_register_duplicate_email` | Super Admin token | Existing email | `409` | `"Email already registered"` | No new records |
| I-AUTH-011 | `test_register_as_admin_forbidden` | Admin token (not super_admin) | Valid data | `403` | `"Operation forbidden"` | No new records |
| I-AUTH-012 | `test_register_as_employee_forbidden` | Employee token | Valid data | `403` | `"Operation forbidden"` | No new records |
| I-AUTH-013 | `test_register_no_token` | No auth header | Valid data | `401` | Unauthorized | No new records |

---

## 2. Employees Module — `test/integration/employees/`

### 2.1 `test_list_employees.py` — `GET /api/employees`

| Test ID | Test Name | Auth | Query Params | Expected Status | Expected Response |
|---------|-----------|------|-------------|:--------------:|-------------------|
| I-EMP-001 | `test_list_employees_as_admin` | Admin token | None | `200` | `{"employees": [...]}` with all employees |
| I-EMP-002 | `test_list_employees_with_search` | Admin token | `?search=john` | `200` | Only employees matching "john" |
| I-EMP-003 | `test_list_employees_as_employee_forbidden` | Employee token | None | `403` | Forbidden |
| I-EMP-004 | `test_list_employees_includes_manager_name` | Admin token | None | `200` | Employee with manager has `manager_name` field populated |
| I-EMP-005 | `test_list_employees_no_token` | None | None | `401` | Unauthorized |

### 2.2 `test_create_employee.py` — `POST /api/employees`

| Test ID | Test Name | Auth | Request Body | Expected Status | DB Side Effect |
|---------|-----------|------|-------------|:--------------:|----------------|
| I-EMP-006 | `test_create_employee_success` | Admin token | `{name, email, password, role, department}` | `201` | New Employee + 5 LeaveBalances |
| I-EMP-007 | `test_create_employee_with_manager` | Admin token | Include `manager_id` | `201` | `manager_id` set on employee |
| I-EMP-008 | `test_create_employee_duplicate_email` | Admin token | Existing email | `409` | No new records |
| I-EMP-009 | `test_create_employee_as_employee` | Employee token | Valid data | `403` | No new records |
| I-EMP-010 | `test_create_employee_as_manager` | Manager token | Valid data | `403` | No new records |

### 2.3 `test_update_employee.py` — `PUT /api/employees/{id}`

| Test ID | Test Name | Auth | Request Body | Expected Status | DB Side Effect |
|---------|-----------|------|-------------|:--------------:|----------------|
| I-EMP-011 | `test_update_employee_name` | Admin token | `{name: "New Name"}` | `200` | Employee name updated |
| I-EMP-012 | `test_update_employee_role` | Admin token | `{role: "manager"}` | `200` | Employee role updated |
| I-EMP-013 | `test_update_employee_department` | Admin token | `{department: "Design"}` | `200` | Department updated |
| I-EMP-014 | `test_update_employee_assign_manager` | Admin token | `{manager_id: <id>}` | `200` | Manager assigned |
| I-EMP-015 | `test_update_employee_not_found` | Admin token | Target ID = 99999 | `404` | No changes |
| I-EMP-016 | `test_update_employee_as_employee` | Employee token | Valid data | `403` | No changes |

### 2.4 `test_deactivate_employee.py` — `DELETE /api/employees/{id}`

| Test ID | Test Name | Auth | Target | Expected Status | DB Side Effect |
|---------|-----------|------|--------|:--------------:|----------------|
| I-EMP-017 | `test_deactivate_employee_success` | Admin token | Valid employee ID | `200` | `is_active = False` |
| I-EMP-018 | `test_deactivate_self` | Admin token | Own admin ID | `400` | No changes |
| I-EMP-019 | `test_deactivate_not_found` | Admin token | ID = 99999 | `404` | No changes |
| I-EMP-020 | `test_deactivate_as_employee` | Employee token | Any ID | `403` | No changes |
| I-EMP-021 | `test_deactivated_user_cannot_login` | None | Login with deactivated user | `403` | — |

---

## 3. Leaves Module — `test/integration/leaves/` ⭐

### 3.1 `test_apply_leave.py` — `POST /api/leaves`

| Test ID | Test Name | Auth | Request Body | Expected Status | DB Side Effect |
|---------|-----------|------|-------------|:--------------:|----------------|
| I-LV-001 | `test_apply_casual_leave` | Employee token | `{leave_type:"casual", start_date:tomorrow, end_date:+2d, reason:"test"}` | `201` | LeaveRequest created, balance.used_days += 3 |
| I-LV-002 | `test_apply_sick_leave` | Employee token | `{leave_type:"sick", ...}` | `201` | Created |
| I-LV-003 | `test_apply_unpaid_leave` | Employee token | `{leave_type:"unpaid", ...}` | `201` | No balance deduction |
| I-LV-004 | `test_apply_leave_past_start` | Employee token | `start_date: yesterday` | `400` | Not created |
| I-LV-005 | `test_apply_leave_end_before_start` | Employee token | `end_date < start_date` | `400` | Not created |
| I-LV-006 | `test_apply_leave_overlapping` | Employee token | Overlap with existing | `400` | Not created |
| I-LV-007 | `test_apply_leave_insufficient_balance` | Employee token | Days > remaining | `400` | Not created, balance unchanged |
| I-LV-008 | `test_apply_leave_invalid_type` | Employee token | `leave_type:"vacation"` | `422` | Pydantic validation error |
| I-LV-009 | `test_apply_leave_no_token` | None | Valid body | `401` | Not created |
| I-LV-010 | `test_apply_leave_creates_notification` | Employee with manager | Valid body | `201` | Notification row created for manager |

### 3.2 `test_leave_history.py` — `GET /api/leaves`

| Test ID | Test Name | Auth | Query Params | Expected Status | Expected Response |
|---------|-----------|------|-------------|:--------------:|-------------------|
| I-LV-011 | `test_get_leave_history_all` | Employee token | `?status=all` | `200` | All employee's leaves |
| I-LV-012 | `test_get_leave_history_pending` | Employee token | `?status=pending` | `200` | Only pending leaves |
| I-LV-013 | `test_get_leave_history_approved` | Employee token | `?status=approved` | `200` | Only approved leaves |
| I-LV-014 | `test_get_leave_history_empty` | New employee token | None | `200` | `{"leaves": []}` |
| I-LV-015 | `test_leave_history_includes_approval_data` | Employee token | After approval | `200` | Leaves have `approval.manager_name`, `approval.comments` |

### 3.3 `test_leave_balance.py` — `GET /api/leaves/balance`

| Test ID | Test Name | Auth | Expected Status | Expected Response |
|---------|-----------|------|:--------------:|-------------------|
| I-LV-016 | `test_get_balance_success` | Employee token | `200` | `{"balances": [...], "year": 2026}` with 5 leave types |
| I-LV-017 | `test_balance_after_apply` | Employee token (after applying 3-day casual) | `200` | Casual `remaining` = `total - 3` |
| I-LV-018 | `test_balance_no_token` | None | `401` | Unauthorized |

### 3.4 `test_cancel_leave.py` — `PUT /api/leaves/{id}/cancel`

| Test ID | Test Name | Auth | Target | Expected Status | DB Side Effect |
|---------|-----------|------|--------|:--------------:|----------------|
| I-LV-019 | `test_cancel_pending_leave` | Employee token | Own pending leave | `200` | Status → cancelled, balance restored |
| I-LV-020 | `test_cancel_approved_leave` | Employee token | Own approved leave | `400` | No change |
| I-LV-021 | `test_cancel_other_users_leave` | Employee token | Another user's leave | `403` | No change |
| I-LV-022 | `test_cancel_nonexistent` | Employee token | ID = 99999 | `404` | No change |

### 3.5 `test_pending_requests.py` — `GET /api/leaves/pending`

| Test ID | Test Name | Auth | Expected Status | Expected Response |
|---------|-----------|------|:--------------:|-------------------|
| I-LV-023 | `test_pending_as_manager` | Manager token | `200` | Only direct reports' pending requests |
| I-LV-024 | `test_pending_as_admin` | Admin token | `200` | All pending requests (org-wide) |
| I-LV-025 | `test_pending_as_employee` | Employee token | `403` | Forbidden |
| I-LV-026 | `test_pending_includes_employee_info` | Manager token | `200` | Each item has `employee_name`, `department` |

### 3.6 `test_approve_leave.py` — `PUT /api/leaves/{id}/approve`

| Test ID | Test Name | Auth | Body | Expected Status | DB Side Effect |
|---------|-----------|------|------|:--------------:|----------------|
| I-LV-027 | `test_approve_leave_success` | Manager token | `{comments:"OK"}` | `200` | Status → approved, LeaveApproval created |
| I-LV-028 | `test_approve_already_approved` | Manager token | Same leave again | `400` | No change |
| I-LV-029 | `test_approve_other_team_leave` | Manager token | Non-report's leave | `403` | No change |
| I-LV-030 | `test_approve_as_admin` | Admin token | Any pending leave | `200` | Approved (admin bypass) |
| I-LV-031 | `test_approve_as_employee` | Employee token | Any pending leave | `403` | No change |
| I-LV-032 | `test_approve_notifies_employee` | Manager token | Valid leave | `200` | Notification created for the employee |

### 3.7 `test_reject_leave.py` — `PUT /api/leaves/{id}/reject`

| Test ID | Test Name | Auth | Body | Expected Status | DB Side Effect |
|---------|-----------|------|------|:--------------:|----------------|
| I-LV-033 | `test_reject_leave_success` | Manager token | `{comments:"Denied"}` | `200` | Status → rejected, balance restored, LeaveApproval created |
| I-LV-034 | `test_reject_leave_no_reason` | Manager token | `{comments:""}` | `400` | No change |
| I-LV-035 | `test_reject_already_rejected` | Manager token | Same leave again | `400` | No change |
| I-LV-036 | `test_reject_balance_restored` | Manager token | Valid reject | `200` | `balance.used_days` decremented |
| I-LV-037 | `test_reject_unpaid_no_balance_change` | Manager token | Unpaid leave | `200` | No balance modification |
| I-LV-038 | `test_reject_as_employee` | Employee token | Any leave | `403` | No change |
| I-LV-039 | `test_reject_notifies_employee` | Manager token | Valid reject | `200` | Notification with rejection reason |

---

## 4. Dashboard Module — `test/integration/dashboard/`

### `test_dashboard_stats.py` — `GET /api/dashboard/stats`

| Test ID | Test Name | Auth | Expected Status | Expected Response |
|---------|-----------|------|:--------------:|-------------------|
| I-DASH-001 | `test_employee_dashboard` | Employee token | `200` | `role`, `stats`, `recent_leaves`, `balances` present |
| I-DASH-002 | `test_manager_dashboard` | Manager token | `200` | Includes `team_pending_count` and `team_on_leave_today` |
| I-DASH-003 | `test_admin_dashboard` | Admin token | `200` | Includes `org_stats` with `total_employees`, `department_breakdown` |
| I-DASH-004 | `test_dashboard_no_token` | None | `401` | Unauthorized |
| I-DASH-005 | `test_dashboard_stats_accurate` | Employee with known data | `200` | `stats.pending`, `stats.approved` match actual DB counts |

---

## 5. Settings Module — `test/integration/settings/`

### 5.1 `test_get_settings.py` — `GET /api/settings`

| Test ID | Test Name | Auth | Expected Status | Expected Response |
|---------|-----------|------|:--------------:|-------------------|
| I-SET-001 | `test_get_settings_super_admin` | Super Admin token | `200` | All 5 leave limit fields present |
| I-SET-002 | `test_get_settings_admin_forbidden` | Admin token | `403` | Forbidden |
| I-SET-003 | `test_get_settings_employee_forbidden` | Employee token | `403` | Forbidden |
| I-SET-004 | `test_get_settings_creates_defaults` | Super Admin (empty DB) | `200` | Default values: casual=12, sick=12, earned=18 |

### 5.2 `test_update_settings.py` — `PUT /api/settings`

| Test ID | Test Name | Auth | Body | Expected Status | DB Side Effect |
|---------|-----------|------|------|:--------------:|----------------|
| I-SET-005 | `test_update_settings_success` | Super Admin | `{max_casual_leave: 15}` | `200` | `max_casual_leave` updated to 15 |
| I-SET-006 | `test_update_all_settings` | Super Admin | All 5 fields | `200` | All values updated |
| I-SET-007 | `test_update_settings_admin_forbidden` | Admin | Valid body | `403` | No change |
| I-SET-008 | `test_update_settings_employee_forbidden` | Employee | Valid body | `403` | No change |

---

## 6. Reports Module — `test/integration/reports/`

### `test_org_report.py` — `GET /api/reports/organization`

| Test ID | Test Name | Auth | Expected Status | Expected Response |
|---------|-----------|------|:--------------:|-------------------|
| I-RPT-001 | `test_org_report_super_admin` | Super Admin | `200` | `org_stats` with `total_employees`, `total_admins`, `total_leave_requests`, `approved_leaves`, `rejected_leaves`, `department_breakdown`, `role_breakdown` |
| I-RPT-002 | `test_org_report_admin_forbidden` | Admin | `403` | Forbidden |
| I-RPT-003 | `test_org_report_employee_forbidden` | Employee | `403` | Forbidden |
| I-RPT-004 | `test_org_report_counts_accurate` | Super Admin (known data) | `200` | All counts match actual DB |

---

## 7. Notifications Module — `test/integration/notifications/`

### 7.1 `test_list_notifications.py` — `GET /api/notifications`

| Test ID | Test Name | Auth | Expected Status | Expected Response |
|---------|-----------|------|:--------------:|-------------------|
| I-NOT-001 | `test_list_notifications_success` | Employee token | `200` | `{"notifications": [...]}` |
| I-NOT-002 | `test_list_notifications_max_20` | User with 25 notifications | `200` | Only 20 returned (limit) |
| I-NOT-003 | `test_list_notifications_ordered` | User with multiple | `200` | Ordered by `created_at` descending |
| I-NOT-004 | `test_list_notifications_own_only` | User A token | `200` | Only User A's notifications (not User B's) |

### 7.2 `test_mark_read.py` — `PUT /api/notifications/{id}/read`

| Test ID | Test Name | Auth | Target | Expected Status | DB Side Effect |
|---------|-----------|------|--------|:--------------:|----------------|
| I-NOT-005 | `test_mark_notification_read` | Employee token | Own notification | `200` | `is_read = True` |
| I-NOT-006 | `test_mark_other_user_notification` | Employee token | Other user's notification | `404` | No change |
| I-NOT-007 | `test_mark_nonexistent` | Employee token | ID = 99999 | `404` | No change |

### 7.3 `test_mark_all_read.py` — `PUT /api/notifications/read-all`

| Test ID | Test Name | Auth | Expected Status | DB Side Effect |
|---------|-----------|------|:--------------:|----------------|
| I-NOT-008 | `test_mark_all_read_success` | Employee with 5 unread | `200` | All 5 notifications set to `is_read = True` |
| I-NOT-009 | `test_mark_all_read_no_notifications` | Employee with 0 notifications | `200` | No error, no changes |
| I-NOT-010 | `test_mark_all_only_affects_own` | Employee A | `200` | Employee B's notifications unchanged |

---

## 📋 Total Integration Test Count

| Module | Test Count |
|--------|:---------:|
| Auth (login + register) | 13 |
| Employees (CRUD) | 21 |
| Leaves (apply, history, balance, cancel, pending, approve, reject) | 39 |
| Dashboard | 5 |
| Settings | 8 |
| Reports | 4 |
| Notifications | 10 |
| **TOTAL** | **100** |

---

> **Next:** Proceed to [03-E2E-TESTS.md](./03-E2E-TESTS.md) for full workflow tests.
