# 🖥️ Frontend Tests — Detailed Plan

Frontend tests cover the **Next.js client application** — React components, context providers, the API service layer, and utility functions.

---

## 📌 Frontend Testing Layers

| Layer | What to Test | Tool | Mocking |
|-------|-------------|------|---------|
| **Utility Functions** | Pure logic in `lib/utils.js` | Jest | None needed |
| **API Service Layer** | `services/api.js` request building | Jest + fetch mock | Mock `fetch` |
| **React Contexts** | `AuthContext`, `NotificationContext` state | React Testing Library | Mock `localStorage`, `fetch` |
| **Page Components** | Each page renders correctly | React Testing Library | Mock API calls, contexts |
| **User Interactions** | Click buttons, fill forms, navigate | React Testing Library + user-event | Mock API responses |

---

## 🛠️ Setup

### Install Dependencies
```bash
cd client
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### `jest.config.js`
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}
```

### `jest.setup.js`
```javascript
import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value }),
    removeItem: jest.fn(key => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

---

## 1. Utility Functions — `lib/utils.js`

Tests for: [`client/src/lib/utils.js`](../../client/src/lib/utils.js)

| Test ID | Test Name | Function | Input | Expected Output |
|---------|-----------|----------|-------|-----------------|
| F-UTIL-001 | `test_cn_single_class` | `cn` | `"btn"` | `"btn"` |
| F-UTIL-002 | `test_cn_multiple_classes` | `cn` | `"btn", "primary"` | `"btn primary"` |
| F-UTIL-003 | `test_cn_filters_falsy` | `cn` | `"btn", false, null, "active"` | `"btn active"` |
| F-UTIL-004 | `test_cn_empty` | `cn` | (no args) | `""` |
| F-UTIL-005 | `test_formatDate` | `formatDate` | `"2026-06-15T10:00:00Z"` | `"Jun 15, 2026"` |
| F-UTIL-006 | `test_formatDateTime` | `formatDateTime` | `"2026-06-15T10:30:00Z"` | Contains date and time |
| F-UTIL-007 | `test_getStatusColor_pending` | `getStatusColor` | `"pending"` | `{ bg: "rgba(245,...)", text: "#f59e0b", dot: "#f59e0b" }` |
| F-UTIL-008 | `test_getStatusColor_approved` | `getStatusColor` | `"approved"` | Green colors |
| F-UTIL-009 | `test_getStatusColor_rejected` | `getStatusColor` | `"rejected"` | Rose colors |
| F-UTIL-010 | `test_getStatusColor_cancelled` | `getStatusColor` | `"cancelled"` | Gray colors |
| F-UTIL-011 | `test_getStatusColor_unknown` | `getStatusColor` | `"unknown"` | Default gray colors |
| F-UTIL-012 | `test_getLeaveTypeIcon` | `getLeaveTypeIcon` | `"casual"` | `"📅"` |
| F-UTIL-013 | `test_getLeaveTypeIcon_sick` | `getLeaveTypeIcon` | `"sick"` | `"🏥"` |
| F-UTIL-014 | `test_getLeaveTypeIcon_unknown` | `getLeaveTypeIcon` | `"xyz"` | `"📋"` (default) |
| F-UTIL-015 | `test_checkOverlap_overlapping` | `checkOverlap` | `(Jun15, Jun18, Jun16, Jun20)` | `true` |
| F-UTIL-016 | `test_checkOverlap_no_overlap` | `checkOverlap` | `(Jun15, Jun16, Jun20, Jun22)` | `false` |
| F-UTIL-017 | `test_checkOverlap_same_day` | `checkOverlap` | `(Jun15, Jun15, Jun15, Jun15)` | `true` |
| F-UTIL-018 | `test_checkOverlap_adjacent` | `checkOverlap` | `(Jun15, Jun16, Jun17, Jun18)` | `false` |

### Sample Test Code:
```javascript
// __tests__/lib/utils.test.js

import { cn, formatDate, getStatusColor, getLeaveTypeIcon, checkOverlap } from '@/lib/utils'

describe('cn (classNames)', () => {
  test('joins multiple classes', () => {
    expect(cn('btn', 'primary')).toBe('btn primary')
  })

  test('filters out falsy values', () => {
    expect(cn('btn', false, null, undefined, 'active')).toBe('btn active')
  })
})

describe('getStatusColor', () => {
  test('pending returns amber colors', () => {
    const result = getStatusColor('pending')
    expect(result.text).toBe('#f59e0b')
  })

  test('unknown status returns default gray', () => {
    const result = getStatusColor('anything')
    expect(result.text).toBe('#8b92b6')
  })
})

describe('checkOverlap', () => {
  test('overlapping dates return true', () => {
    expect(checkOverlap('2026-06-15', '2026-06-18', '2026-06-16', '2026-06-20')).toBe(true)
  })

  test('non-overlapping dates return false', () => {
    expect(checkOverlap('2026-06-15', '2026-06-16', '2026-06-20', '2026-06-22')).toBe(false)
  })
})
```

---

## 2. API Service Layer — `services/api.js`

Tests for: [`client/src/services/api.js`](../../client/src/services/api.js)

### 2.1 Core `request()` function

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-API-001 | `test_request_adds_auth_header` | Token exists in localStorage | `Authorization: Bearer <token>` header is present |
| F-API-002 | `test_request_no_token` | No token in localStorage | No `Authorization` header |
| F-API-003 | `test_request_get_method` | Default method | Request uses `GET` |
| F-API-004 | `test_request_post_with_body` | `options.body` provided | Body is `JSON.stringify`'d |
| F-API-005 | `test_request_with_query_params` | `options.params` provided | URL has `?key=value` appended |
| F-API-006 | `test_request_filters_empty_params` | Params with `undefined`/`null` values | Those params are excluded from URL |
| F-API-007 | `test_request_401_redirects_to_login` | Server returns 401 | `localStorage` cleared, `window.location.href` set to `/login` |
| F-API-008 | `test_request_error_throws` | Server returns 4xx/5xx | Throws Error with `detail` message |
| F-API-009 | `test_request_success_returns_json` | Server returns 200 | Returns parsed JSON data |

### 2.2 `authApi`

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-API-010 | `test_authApi_login_sends_form_data` | Login call | Uses `application/x-www-form-urlencoded`, sends `username` + `password` |
| F-API-011 | `test_authApi_login_success` | 200 response | Returns `{ access_token, user }` |
| F-API-012 | `test_authApi_login_failure` | 401 response | Throws Error "Login failed" |
| F-API-013 | `test_authApi_register` | Register call | Uses `POST /api/auth/register` with JSON body |

### 2.3 `leavesApi`

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-API-014 | `test_leavesApi_apply` | `leavesApi.apply(body)` | `POST /api/leaves` with body |
| F-API-015 | `test_leavesApi_history` | `leavesApi.history({status:"pending"})` | `GET /api/leaves?status=pending` |
| F-API-016 | `test_leavesApi_balance` | `leavesApi.balance()` | `GET /api/leaves/balance` |
| F-API-017 | `test_leavesApi_cancel` | `leavesApi.cancel(5)` | `PUT /api/leaves/5/cancel` |
| F-API-018 | `test_leavesApi_pending` | `leavesApi.pending()` | `GET /api/leaves/pending` |
| F-API-019 | `test_leavesApi_approve` | `leavesApi.approve(5, "OK")` | `PUT /api/leaves/5/approve` with `{comments: "OK"}` |
| F-API-020 | `test_leavesApi_reject` | `leavesApi.reject(5, "No")` | `PUT /api/leaves/5/reject` with `{comments: "No"}` |

### 2.4 Other API modules

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-API-021 | `test_employeesApi_list` | `employeesApi.list({search:"john"})` | `GET /api/employees?search=john` |
| F-API-022 | `test_employeesApi_create` | `employeesApi.create(body)` | `POST /api/employees` |
| F-API-023 | `test_employeesApi_update` | `employeesApi.update(1, body)` | `PUT /api/employees/1` |
| F-API-024 | `test_employeesApi_deactivate` | `employeesApi.deactivate(1)` | `DELETE /api/employees/1` |
| F-API-025 | `test_dashboardApi_stats` | `dashboardApi.stats()` | `GET /api/dashboard/stats` |
| F-API-026 | `test_settingsApi_update` | `settingsApi.update(body)` | `PUT /api/settings` |
| F-API-027 | `test_reportsApi_organization` | `reportsApi.organization()` | `GET /api/reports/organization` |
| F-API-028 | `test_notificationsApi_list` | `notificationsApi.list()` | `GET /api/notifications` |
| F-API-029 | `test_notificationsApi_markRead` | `notificationsApi.markRead(1)` | `PUT /api/notifications/1/read` |
| F-API-030 | `test_notificationsApi_markAllRead` | `notificationsApi.markAllRead()` | `PUT /api/notifications/read-all` |

---

## 3. AuthContext — `context/AuthContext.js`

Tests for: [`client/src/context/AuthContext.js`](../../client/src/context/AuthContext.js)

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-CTX-001 | `test_initial_state_loading` | Context starts in loading state | `loading === true` initially |
| F-CTX-002 | `test_loads_user_from_localStorage` | Token + user in localStorage | `user` is populated from stored data, `loading === false` |
| F-CTX-003 | `test_no_stored_user` | Empty localStorage | `user === null`, `loading === false` |
| F-CTX-004 | `test_login_stores_token` | Call `login(token, userData)` | `localStorage.setItem('token', ...)` called |
| F-CTX-005 | `test_login_stores_user` | Call `login(token, userData)` | `localStorage.setItem('user', ...)` called with JSON |
| F-CTX-006 | `test_login_updates_state` | Call `login(token, userData)` | `user` state matches `userData` |
| F-CTX-007 | `test_logout_clears_storage` | Call `logout()` | `localStorage.removeItem('token')` and `removeItem('user')` called |
| F-CTX-008 | `test_logout_redirects_to_login` | Call `logout()` | `window.location.href === '/login'` |
| F-CTX-009 | `test_logout_clears_user_state` | Call `logout()` | `user === null` |
| F-CTX-010 | `test_updateUser_merges_data` | Call `updateUser({department: "Design"})` | User object has new department, other fields preserved |
| F-CTX-011 | `test_corrupt_localStorage_handled` | Stored user is invalid JSON | `user === null`, no crash |
| F-CTX-012 | `test_useAuth_outside_provider_throws` | Call `useAuth()` without `AuthProvider` | Throws "useAuth must be used within an AuthProvider" |

---

## 4. NotificationContext — `context/NotificationContext.js`

Tests for: [`client/src/context/NotificationContext.js`](../../client/src/context/NotificationContext.js)

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-NCTX-001 | `test_fetches_on_mount` | Context mounts with logged-in user | `fetch` called with `/api/notifications` |
| F-NCTX-002 | `test_no_fetch_without_user` | No user logged in | `fetch` NOT called, notifications empty |
| F-NCTX-003 | `test_unread_count_calculated` | 3 of 5 notifications are unread | `unreadCount === 3` |
| F-NCTX-004 | `test_markAsRead_updates_state` | Call `markAsRead(1)` | Notification 1 becomes `is_read: true`, `unreadCount` decremented |
| F-NCTX-005 | `test_markAllAsRead_updates_state` | Call `markAllAsRead()` | All notifications `is_read: true`, `unreadCount === 0` |
| F-NCTX-006 | `test_polling_interval` | After mount | `setInterval` called with 30000ms (30 seconds) |
| F-NCTX-007 | `test_cleanup_clears_interval` | Unmount | `clearInterval` called |
| F-NCTX-008 | `test_fetch_error_handled` | API returns error | No crash, console.error logged |

---

## 5. Page Component Tests (Key Pages)

### 5.1 Login Page — `app/login/page.js`

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-PAGE-001 | `test_login_page_renders` | Page renders | Email input, password input, and Login button visible |
| F-PAGE-002 | `test_login_empty_submission` | Click login with empty fields | Error "Please fill in all fields" shown |
| F-PAGE-003 | `test_login_success_redirects` | Valid login mock | `login()` from AuthContext called, redirects to `/dashboard` |
| F-PAGE-004 | `test_login_failure_shows_error` | API returns error | Error message displayed to user |
| F-PAGE-005 | `test_login_loading_state` | During API call | Button shows loading indicator, inputs disabled |

### 5.2 Dashboard Page — `app/dashboard/page.js`

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-PAGE-006 | `test_dashboard_renders_stats` | Employee dashboard | Shows stats cards (total, pending, approved, rejected) |
| F-PAGE-007 | `test_dashboard_renders_balances` | Employee dashboard | Shows leave balance cards |
| F-PAGE-008 | `test_dashboard_renders_recent_leaves` | Employee dashboard | Shows recent leave history |
| F-PAGE-009 | `test_dashboard_manager_extras` | Manager role | Shows team pending count and team on leave today |
| F-PAGE-010 | `test_dashboard_admin_org_stats` | Admin role | Shows organization-wide statistics |
| F-PAGE-011 | `test_dashboard_redirects_unauthenticated` | No user | Redirects to `/login` |

### 5.3 Apply Leave Page — `app/apply-leave/page.js`

| Test ID | Test Name | What to Test | Expected |
|---------|-----------|-------------|----------|
| F-PAGE-012 | `test_apply_leave_form_renders` | Page renders | All form fields visible: type, dates, reason |
| F-PAGE-013 | `test_apply_leave_submission` | Fill and submit | API called with correct payload |
| F-PAGE-014 | `test_apply_leave_validation` | Invalid dates | Client-side validation error shown |
| F-PAGE-015 | `test_apply_leave_success_feedback` | API returns 201 | Success toast/message shown |

---

## 📋 Total Frontend Test Count

| Category | Test Count |
|----------|:---------:|
| Utility Functions | 18 |
| API Service Layer | 30 |
| AuthContext | 12 |
| NotificationContext | 8 |
| Page Components | 15 |
| **TOTAL** | **83** |

---

> **Next:** Proceed to [06-FIXTURES-AND-SETUP.md](./06-FIXTURES-AND-SETUP.md) for the test infrastructure setup guide.
