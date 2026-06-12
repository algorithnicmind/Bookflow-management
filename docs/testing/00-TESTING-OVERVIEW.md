# 🧪 Leaveflow Management System — Testing Master Plan

**Version:** 1.0  
**Last Updated:** June 2026  
**Tech Stack:** FastAPI (Python) Backend · Next.js (React) Frontend · PostgreSQL (Neon) DB  
**Test Framework:** `pytest` + `pytest-asyncio` (Backend) · Manual / Playwright (Frontend)

---

## 📖 How to Read This Folder

Each file in `docs/testing/` covers **one category of testing** in complete detail. Read them in order (01 → 06), or jump to the one you need.

| # | File | What It Covers | When to Use |
|---|------|----------------|-------------|
| 01 | [01-UNIT-TESTS.md](./01-UNIT-TESTS.md) | Tests for individual services, repositories, validators, and utility functions **in isolation** (mocked dependencies). | When you change any business logic inside a `services.py`, `repositories.py`, or `utils.js`. |
| 02 | [02-INTEGRATION-TESTS.md](./02-INTEGRATION-TESTS.md) | Tests that call actual API endpoints through FastAPI's `TestClient` and hit a **real test database**. | When you add/modify an API route, change a schema, or update database models. |
| 03 | [03-E2E-TESTS.md](./03-E2E-TESTS.md) | Full end-to-end workflow tests that simulate **real user journeys** across multiple API calls. | Before any release; to validate that complete business flows (login → apply → approve → check balance) work together. |
| 04 | [04-PERFORMANCE-TESTS.md](./04-PERFORMANCE-TESTS.md) | Load testing and stress testing to ensure the system handles concurrent users. | Before deploying to production, or after major architectural changes. |
| 05 | [05-FRONTEND-TESTS.md](./05-FRONTEND-TESTS.md) | Tests for React components, contexts, API service layer, and utility functions on the client side. | When you change any page, component, context, or the `api.js` service layer. |
| 06 | [06-FIXTURES-AND-SETUP.md](./06-FIXTURES-AND-SETUP.md) | Shared pytest fixtures, test database configuration, factory helpers, and how to run everything. | Read this **first** before writing any test — it's the foundation. |

---

## 🗂️ Recommended `test/` Folder Structure

Based on your actual codebase modules (`auth`, `employees`, `leaves`, `dashboard`, `settings`, `reports`, `notifications`), here is the **exact folder structure** you should create:

```text
test/
├── conftest.py                          # Root-level shared fixtures
├── pytest.ini                           # Pytest configuration
│
├── fixtures/                            # Reusable test data factories
│   ├── __init__.py
│   ├── database.py                      # Test DB engine, session, and cleanup
│   ├── users.py                         # Employee/User factory helpers
│   ├── leaves.py                        # LeaveRequest, LeaveBalance factories
│   ├── notifications.py                 # Notification factory helpers
│   └── settings.py                      # SystemSetting factory helpers
│
├── unit/                                # Isolated logic tests (mocked DB)
│   ├── __init__.py
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── test_auth_service.py         # authenticate_user, register_admin_user
│   │   └── test_security.py            # JWT creation, password hashing
│   ├── employees/
│   │   ├── __init__.py
│   │   ├── test_employee_service.py     # CRUD, deactivation, duplicate check
│   │   └── test_employee_repository.py  # DB query methods
│   ├── leaves/
│   │   ├── __init__.py
│   │   ├── test_leave_service.py        # apply, cancel, approve, reject logic
│   │   ├── test_leave_repository.py     # overlap, balance, history queries
│   │   └── test_leave_validators.py     # date validation, balance checks
│   ├── dashboard/
│   │   ├── __init__.py
│   │   └── test_dashboard_service.py    # Stats computation per role
│   ├── settings/
│   │   ├── __init__.py
│   │   └── test_settings_service.py     # Get/update system settings
│   └── notifications/
│       ├── __init__.py
│       └── test_notification_helpers.py # Notification creation helper
│
├── integration/                         # API endpoint tests (real test DB)
│   ├── __init__.py
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── test_login.py               # POST /api/auth/login
│   │   └── test_register.py            # POST /api/auth/register
│   ├── employees/
│   │   ├── __init__.py
│   │   ├── test_list_employees.py      # GET /api/employees
│   │   ├── test_create_employee.py     # POST /api/employees
│   │   ├── test_update_employee.py     # PUT /api/employees/{id}
│   │   └── test_deactivate_employee.py # DELETE /api/employees/{id}
│   ├── leaves/
│   │   ├── __init__.py
│   │   ├── test_apply_leave.py         # POST /api/leaves
│   │   ├── test_leave_history.py       # GET /api/leaves
│   │   ├── test_leave_balance.py       # GET /api/leaves/balance
│   │   ├── test_cancel_leave.py        # PUT /api/leaves/{id}/cancel
│   │   ├── test_pending_requests.py    # GET /api/leaves/pending
│   │   ├── test_approve_leave.py       # PUT /api/leaves/{id}/approve
│   │   └── test_reject_leave.py        # PUT /api/leaves/{id}/reject
│   ├── dashboard/
│   │   ├── __init__.py
│   │   └── test_dashboard_stats.py     # GET /api/dashboard/stats
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── test_get_settings.py        # GET /api/settings
│   │   └── test_update_settings.py     # PUT /api/settings
│   ├── reports/
│   │   ├── __init__.py
│   │   └── test_org_report.py          # GET /api/reports/organization
│   └── notifications/
│       ├── __init__.py
│       ├── test_list_notifications.py  # GET /api/notifications
│       ├── test_mark_read.py           # PUT /api/notifications/{id}/read
│       └── test_mark_all_read.py       # PUT /api/notifications/read-all
│
├── e2e/                                 # Multi-step workflow tests
│   ├── __init__.py
│   ├── test_employee_leave_flow.py      # Apply → Approve → Check Balance
│   ├── test_leave_rejection_flow.py     # Apply → Reject → Balance Restored
│   ├── test_leave_cancel_flow.py        # Apply → Cancel → Balance Restored
│   ├── test_admin_employee_flow.py      # Create Employee → Login → Apply
│   └── test_notification_flow.py        # Apply → Manager gets notif → Approve → Employee gets notif
│
└── performance/                         # Load & stress tests
    ├── __init__.py
    ├── test_login_load.py               # Concurrent login requests
    ├── test_leave_apply_load.py         # Concurrent leave applications
    └── test_dashboard_load.py           # Dashboard stats under load
```

---

## 🚀 Quick Start — Running Tests

### 1. Install Test Dependencies
```bash
cd server
pip install pytest pytest-asyncio httpx aiosqlite
```

### 2. Run All Tests
```bash
# From the server/ directory
pytest test/ -v

# Run only unit tests
pytest test/unit/ -v

# Run only integration tests
pytest test/integration/ -v

# Run only e2e tests
pytest test/e2e/ -v

# Run a specific module
pytest test/unit/leaves/ -v
```

### 3. Run with Coverage
```bash
pip install pytest-cov
pytest test/ --cov=app --cov-report=html
```

---

## 🏗️ Module → Test Mapping

This table maps every source file to the test files that should cover it:

| Source File | Unit Test | Integration Test | E2E Test |
|-------------|-----------|------------------|----------|
| `app/core/security.py` | `test_security.py` | — | — |
| `app/core/dependencies.py` | `test_security.py` | All auth-gated tests | — |
| `app/modules/auth/services.py` | `test_auth_service.py` | `test_login.py`, `test_register.py` | `test_admin_employee_flow.py` |
| `app/modules/employees/services.py` | `test_employee_service.py` | `test_create/list/update/deactivate_employee.py` | `test_admin_employee_flow.py` |
| `app/modules/employees/repositories.py` | `test_employee_repository.py` | — | — |
| `app/modules/leaves/services.py` | `test_leave_service.py` | `test_apply/cancel/approve/reject_leave.py` | `test_employee_leave_flow.py` |
| `app/modules/leaves/repositories.py` | `test_leave_repository.py` | — | — |
| `app/modules/dashboard/services.py` | `test_dashboard_service.py` | `test_dashboard_stats.py` | — |
| `app/modules/settings/services.py` | `test_settings_service.py` | `test_get/update_settings.py` | — |
| `app/modules/reports/routes.py` | — | `test_org_report.py` | — |
| `app/modules/notifications/routes.py` | — | `test_list/mark_read/mark_all_read.py` | `test_notification_flow.py` |

---

## 📊 Priority Order

If you're starting from scratch, write tests in this order:

1. **`06-FIXTURES-AND-SETUP.md`** — Set up test database and helpers first
2. **`01-UNIT-TESTS.md`** — Core business logic (especially leaves)
3. **`02-INTEGRATION-TESTS.md`** — Auth endpoints first, then leaves
4. **`03-E2E-TESTS.md`** — The critical "apply → approve" flow
5. **`05-FRONTEND-TESTS.md`** — Client-side utilities and API layer
6. **`04-PERFORMANCE-TESTS.md`** — Only before production deployment

---

> **Next Step:** Open [06-FIXTURES-AND-SETUP.md](./06-FIXTURES-AND-SETUP.md) to set up your test infrastructure, then proceed to [01-UNIT-TESTS.md](./01-UNIT-TESTS.md).
