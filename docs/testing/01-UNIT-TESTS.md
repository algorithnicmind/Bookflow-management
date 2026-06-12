# 🔬 Unit Tests — Detailed Plan

Unit tests verify **individual functions and methods in isolation**. All database calls and external dependencies are **mocked** so tests run instantly without any DB connection.

---

## 📌 What Is a Unit Test?

- Tests **one function** at a time
- **Mocks** all external dependencies (database sessions, repositories)
- Runs **in-memory**, no real DB needed
- Should execute in **< 1 second** per test

---

## 1. Auth Module — `test/unit/auth/`

### 1.1 `test_auth_service.py`

Tests for: [`server/app/modules/auth/services.py`](../../server/app/modules/auth/services.py)

| Test ID | Test Name | What to Test | Mock Setup | Expected Outcome |
|---------|-----------|-------------|------------|-----------------|
| U-AUTH-001 | `test_authenticate_user_success` | Valid email + correct password | Mock `db.execute` → return Employee with matching bcrypt hash | Returns the Employee object |
| U-AUTH-002 | `test_authenticate_user_wrong_password` | Valid email + wrong password | Mock `db.execute` → return Employee, `pwd_context.verify` returns False | Raises `HTTPException(401)` with "Invalid email or password" |
| U-AUTH-003 | `test_authenticate_user_nonexistent_email` | Email not in DB | Mock `db.execute` → return `None` | Raises `HTTPException(401)` with "Invalid email or password" |
| U-AUTH-004 | `test_authenticate_user_deactivated_account` | Valid credentials but `is_active=False` | Mock → return Employee with `is_active=False` | Raises `HTTPException(403)` with "Account is deactivated" |
| U-AUTH-005 | `test_register_admin_user_success` | Valid admin registration data | Mock `db.execute` → return None (no existing), mock `db.add`, `db.flush`, `db.commit` | Returns new Employee with `role="admin"`, creates 5 LeaveBalance records |
| U-AUTH-006 | `test_register_admin_user_duplicate_email` | Email already exists | Mock `db.execute` → return existing Employee | Raises `HTTPException(409)` with "Email already registered" |
| U-AUTH-007 | `test_register_admin_creates_leave_balances` | Check that 5 leave types are created | Mock DB → track `db.add` calls | Exactly 5 `LeaveBalance` objects added: casual(12), sick(12), earned(18), maternity(182), miscarriage(42) |

#### Sample Test Code:
```python
# test/unit/auth/test_auth_service.py

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.modules.auth.services import authenticate_user, register_admin_user

@pytest.mark.asyncio
async def test_authenticate_user_wrong_password():
    """Should raise 401 when password doesn't match."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_employee = MagicMock(
        email="john@company.com",
        password_hash="$2b$12$hashed",
        is_active=True
    )
    mock_result.scalar_one_or_none.return_value = mock_employee
    mock_db.execute.return_value = mock_result

    with patch("app.modules.auth.services.pwd_context") as mock_pwd:
        mock_pwd.verify.return_value = False  # Wrong password
        with pytest.raises(HTTPException) as exc_info:
            await authenticate_user("john@company.com", "wrongpass", mock_db)
        assert exc_info.value.status_code == 401
        assert "Invalid email or password" in exc_info.value.detail


@pytest.mark.asyncio
async def test_authenticate_user_deactivated():
    """Should raise 403 when account is deactivated."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_employee = MagicMock(
        email="john@company.com",
        password_hash="$2b$12$hashed",
        is_active=False  # Deactivated
    )
    mock_result.scalar_one_or_none.return_value = mock_employee
    mock_db.execute.return_value = mock_result

    with patch("app.modules.auth.services.pwd_context") as mock_pwd:
        mock_pwd.verify.return_value = True
        with pytest.raises(HTTPException) as exc_info:
            await authenticate_user("john@company.com", "password123", mock_db)
        assert exc_info.value.status_code == 403
```

---

### 1.2 `test_security.py`

Tests for: [`server/app/core/security.py`](../../server/app/core/security.py)

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-SEC-001 | `test_create_access_token_contains_email` | JWT token contains the `sub` claim | Decode token → `payload["sub"]` == provided email |
| U-SEC-002 | `test_create_access_token_contains_role` | JWT token contains the `role` claim | Decode token → `payload["role"]` == provided role |
| U-SEC-003 | `test_create_access_token_has_expiration` | Token has `exp` field | Decode token → `payload["exp"]` exists and is in the future |
| U-SEC-004 | `test_create_access_token_custom_expiry` | Custom `expires_delta` is respected | Decoded expiry ≈ `now + expires_delta` (within 5s tolerance) |
| U-SEC-005 | `test_create_access_token_default_expiry` | No `expires_delta` → defaults to 15 min | Decoded expiry ≈ `now + 15 min` |
| U-SEC-006 | `test_password_hash_and_verify` | Hash a password, then verify it | `pwd_context.verify(plain, hashed)` returns True |
| U-SEC-007 | `test_password_hash_wrong_password` | Verify with wrong password | `pwd_context.verify(wrong, hashed)` returns False |

---

## 2. Employees Module — `test/unit/employees/`

### 2.1 `test_employee_service.py`

Tests for: [`server/app/modules/employees/services.py`](../../server/app/modules/employees/services.py)

| Test ID | Test Name | What to Test | Mock Setup | Expected Outcome |
|---------|-----------|-------------|------------|-----------------|
| U-EMP-001 | `test_list_employees_returns_all` | Returns formatted list of employees | Mock `repo.list_employees` → 3 employees | Returns list of 3 dicts with all expected fields |
| U-EMP-002 | `test_list_employees_with_manager_name` | Manager name is resolved | Mock employee with `manager_id=1`, mock `repo.get_by_id(1)` → manager | Response includes `"manager_name": "Alice Manager"` |
| U-EMP-003 | `test_list_employees_search_filter` | Search parameter is passed to repo | Call `list_employees(search="john")` | `repo.list_employees` called with `search="john"` |
| U-EMP-004 | `test_create_employee_success` | Valid employee creation | Mock `repo.get_by_email` → None | Employee created, `repo.create` called, 5 LeaveBalances added |
| U-EMP-005 | `test_create_employee_duplicate_email` | Email already exists | Mock `repo.get_by_email` → existing Employee | Raises `HTTPException(409)` |
| U-EMP-006 | `test_create_employee_hashes_password` | Password is not stored in plain text | Track the Employee passed to `repo.create` | `new_employee.password_hash` starts with `$2b$` (bcrypt prefix) |
| U-EMP-007 | `test_create_employee_creates_5_balances` | Leave balances are initialized | Count `db.add` calls after create | Exactly 5 LeaveBalance records: casual, sick, earned, maternity, miscarriage |
| U-EMP-008 | `test_update_employee_success` | Partial update works | Mock `repo.get_by_id` → employee | Only specified fields are updated |
| U-EMP-009 | `test_update_employee_not_found` | Employee ID doesn't exist | Mock `repo.get_by_id` → None | Raises `HTTPException(404)` |
| U-EMP-010 | `test_update_employee_partial_fields` | Only `name` sent, other fields unchanged | `data = EmployeeUpdate(name="New Name")` | Only `emp.name` is changed; `emp.role`, `emp.department` untouched |
| U-EMP-011 | `test_deactivate_employee_success` | Employee deactivated | Mock `repo.get_by_id` → active employee | `emp.is_active` set to `False` |
| U-EMP-012 | `test_deactivate_employee_self` | Admin tries to deactivate themselves | `employee_id == current_user_id` | Raises `HTTPException(400)` "Cannot deactivate your own account" |
| U-EMP-013 | `test_deactivate_employee_not_found` | Employee doesn't exist | Mock `repo.get_by_id` → None | Raises `HTTPException(404)` |

### 2.2 `test_employee_repository.py`

Tests for: [`server/app/modules/employees/repositories.py`](../../server/app/modules/employees/repositories.py)

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-EMPR-001 | `test_get_by_id_found` | Query by existing ID | Returns the matching Employee |
| U-EMPR-002 | `test_get_by_id_not_found` | Query by non-existent ID | Returns `None` |
| U-EMPR-003 | `test_get_by_email_found` | Query by existing email | Returns the matching Employee |
| U-EMPR-004 | `test_list_employees_no_search` | List all employees (no filter) | Returns all employees |
| U-EMPR-005 | `test_list_employees_with_search` | Search by partial name | Returns only matching employees (ilike) |
| U-EMPR-006 | `test_create_adds_to_session` | `create()` calls `db.add` and `db.flush` | Employee is added to session and flushed |

---

## 3. Leaves Module — `test/unit/leaves/` ⭐ (Highest Priority)

### 3.1 `test_leave_service.py`

Tests for: [`server/app/modules/leaves/services.py`](../../server/app/modules/leaves/services.py) — **This is the most complex service with the most business rules.**

#### Apply Leave Tests

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-LV-001 | `test_apply_leave_success` | Valid casual leave application | Leave created with `status="pending"`, balance `used_days` incremented |
| U-LV-002 | `test_apply_leave_start_date_in_past` | Start date is yesterday | Raises `HTTPException(400)` "Start date cannot be in the past" |
| U-LV-003 | `test_apply_leave_end_before_start` | End date < start date | Raises `HTTPException(400)` "End date must be on or after start date" |
| U-LV-004 | `test_apply_leave_overlapping_dates` | Overlap with existing pending/approved leave | Raises `HTTPException(400)` "overlapping leave request" |
| U-LV-005 | `test_apply_leave_insufficient_balance` | 2 remaining days, requesting 5 | Raises `HTTPException(400)` "Insufficient casual balance" |
| U-LV-006 | `test_apply_leave_no_balance_record` | No LeaveBalance record for this type/year | Raises `HTTPException(400)` "No casual balance record found" |
| U-LV-007 | `test_apply_unpaid_leave_skips_balance_check` | Unpaid leave type | No balance check performed, leave created |
| U-LV-008 | `test_apply_leave_deducts_balance` | 12 total, 0 used, request 3 days | `balance.used_days` becomes 3 |
| U-LV-009 | `test_apply_leave_notifies_manager` | Employee has a manager_id | `_create_notification` called with `manager_id` as `user_id` |
| U-LV-010 | `test_apply_leave_no_manager_no_notification` | Employee has no manager_id | No notification created |

#### Cancel Leave Tests

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-LV-011 | `test_cancel_leave_success` | Cancel own pending leave | Status → "cancelled", balance restored |
| U-LV-012 | `test_cancel_leave_not_found` | Leave ID doesn't exist | Raises `HTTPException(404)` |
| U-LV-013 | `test_cancel_leave_not_owner` | Try to cancel another user's leave | Raises `HTTPException(403)` "You can only cancel your own" |
| U-LV-014 | `test_cancel_leave_not_pending` | Try to cancel an approved leave | Raises `HTTPException(400)` "Only pending leaves can be cancelled" |
| U-LV-015 | `test_cancel_leave_restores_balance` | 12 total, 5 used, cancel 3-day leave | `balance.used_days` becomes 2 |
| U-LV-016 | `test_cancel_unpaid_leave_no_balance_change` | Cancel unpaid leave | No balance modification |

#### Approve Leave Tests

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-LV-017 | `test_approve_leave_success` | Manager approves own report's leave | Status → "approved", `LeaveApproval` created |
| U-LV-018 | `test_approve_leave_not_found` | Leave ID doesn't exist | Raises `HTTPException(404)` |
| U-LV-019 | `test_approve_leave_not_pending` | Leave is already approved | Raises `HTTPException(400)` "Only pending leaves can be approved" |
| U-LV-020 | `test_approve_leave_not_direct_report` | Manager tries to approve non-report's leave | Raises `HTTPException(403)` "You can only approve requests from your direct reports" |
| U-LV-021 | `test_approve_leave_admin_bypass` | Admin approves any employee's leave | Approval succeeds (admin is_admin=True) |
| U-LV-022 | `test_approve_leave_creates_notification` | After approval | Notification created for the employee |

#### Reject Leave Tests

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-LV-023 | `test_reject_leave_success` | Manager rejects with reason | Status → "rejected", `LeaveApproval` created, balance restored |
| U-LV-024 | `test_reject_leave_no_reason` | Empty comments | Raises `HTTPException(400)` "Rejection reason is required" |
| U-LV-025 | `test_reject_leave_restores_balance` | Reject a 3-day casual leave | `balance.used_days` decremented by 3 |
| U-LV-026 | `test_reject_unpaid_no_balance_change` | Reject unpaid leave | No balance restoration |
| U-LV-027 | `test_reject_leave_not_pending` | Already rejected leave | Raises `HTTPException(400)` |
| U-LV-028 | `test_reject_leave_creates_notification` | After rejection | Notification with rejection reason sent to employee |

#### Other Leave Service Tests

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-LV-029 | `test_get_leave_history_all` | Fetch all leaves for employee | Returns list of leave dicts, ordered by `created_at` desc |
| U-LV-030 | `test_get_leave_history_filtered` | Filter by status="approved" | Only approved leaves returned |
| U-LV-031 | `test_get_balances` | Fetch all balance types | Returns 5 balance dicts with `remaining` calculated |
| U-LV-032 | `test_get_pending_requests_manager` | Manager fetches pending | Only direct reports' pending requests returned |
| U-LV-033 | `test_get_pending_requests_admin` | Admin fetches pending | All pending requests org-wide returned |
| U-LV-034 | `test_get_business_days_calculation` | 3-day span (Mon-Wed) | Returns `3` |
| U-LV-035 | `test_get_business_days_same_day` | Same start and end date | Returns `1` |

### 3.2 `test_leave_repository.py`

Tests for: [`server/app/modules/leaves/repositories.py`](../../server/app/modules/leaves/repositories.py)

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-LVR-001 | `test_get_overlapping_requests_found` | Overlapping dates with pending/approved | Returns overlapping requests |
| U-LVR-002 | `test_get_overlapping_requests_none` | No overlap | Returns empty list |
| U-LVR-003 | `test_get_overlapping_ignores_cancelled` | Overlap with cancelled leave | Returns empty (cancelled is excluded) |
| U-LVR-004 | `test_get_balance_found` | Balance exists for type+year | Returns LeaveBalance |
| U-LVR-005 | `test_get_balance_not_found` | No balance for type+year | Returns None |
| U-LVR-006 | `test_list_history_ordered_by_date` | Multiple leaves | Returned in `created_at` descending order |
| U-LVR-007 | `test_list_pending_for_manager` | Manager has 2 direct reports with pending | Returns 2 pending requests |

### 3.3 `test_leave_validators.py`

Extracted validation logic tests (can be tested as pure functions):

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-VAL-001 | `test_leave_type_regex_valid` | "casual", "sick", etc. | Schema validation passes |
| U-VAL-002 | `test_leave_type_regex_invalid` | "vacation", "personal" | Schema validation rejects |
| U-VAL-003 | `test_leave_application_schema_valid` | Complete valid payload | Pydantic model creates successfully |
| U-VAL-004 | `test_leave_application_missing_reason` | No reason field | Pydantic `ValidationError` |

---

## 4. Dashboard Module — `test/unit/dashboard/`

### `test_dashboard_service.py`

Tests for: [`server/app/modules/dashboard/services.py`](../../server/app/modules/dashboard/services.py)

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-DASH-001 | `test_employee_dashboard_stats` | Employee role sees own stats | `stats.total_requests`, `stats.pending`, etc. match mock data |
| U-DASH-002 | `test_employee_dashboard_recent_leaves` | Recent leaves capped at 5 | `recent_leaves` has max 5 items |
| U-DASH-003 | `test_manager_dashboard_includes_team_pending` | Manager sees `team_pending_count` | `response.team_pending_count` is populated |
| U-DASH-004 | `test_manager_dashboard_team_on_leave_today` | Manager sees who's on leave | `response.team_on_leave_today` is a list of names |
| U-DASH-005 | `test_admin_dashboard_includes_org_stats` | Admin sees org-wide stats | `response.org_stats` includes `total_employees`, `total_requests`, `department_breakdown` |
| U-DASH-006 | `test_employee_dashboard_no_team_stats` | Employee role | `response.team_pending_count` is None, `response.org_stats` is None |

---

## 5. Settings Module — `test/unit/settings/`

### `test_settings_service.py`

Tests for: [`server/app/modules/settings/services.py`](../../server/app/modules/settings/services.py)

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-SET-001 | `test_get_settings_existing` | Settings row exists | Returns existing SystemSetting |
| U-SET-002 | `test_get_settings_creates_default` | No settings row in DB | Creates new row with defaults: casual=12, sick=12, earned=18 |
| U-SET-003 | `test_update_settings_partial` | Only update `max_casual_leave` | Only casual updated, others unchanged |
| U-SET-004 | `test_update_settings_all_fields` | Update all 5 fields | All fields reflect new values |
| U-SET-005 | `test_update_settings_none_fields_ignored` | `SettingsUpdate(max_casual_leave=None)` | No field is updated (all None = no changes) |

---

## 6. Notifications — `test/unit/notifications/`

### `test_notification_helpers.py`

Tests for the `_create_notification` helper inside [`server/app/modules/leaves/services.py`](../../server/app/modules/leaves/services.py)

| Test ID | Test Name | What to Test | Expected Outcome |
|---------|-----------|-------------|-----------------|
| U-NOT-001 | `test_create_notification_adds_to_session` | Notification is added to DB session | `db.add` called with a Notification object |
| U-NOT-002 | `test_create_notification_fields` | All fields are set correctly | `title`, `message`, `type`, `action_url` match inputs |
| U-NOT-003 | `test_create_notification_default_type` | No type specified → defaults to "info" | `notification.type == "info"` |

---

## 📋 Total Unit Test Count

| Module | Test Count |
|--------|:---------:|
| Auth (services + security) | 14 |
| Employees (service + repository) | 19 |
| Leaves (service + repository + validators) | 39 |
| Dashboard | 6 |
| Settings | 5 |
| Notifications | 3 |
| **TOTAL** | **86** |

---

> **Next:** Proceed to [02-INTEGRATION-TESTS.md](./02-INTEGRATION-TESTS.md) for API endpoint tests.
