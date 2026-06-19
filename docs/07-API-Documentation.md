# API Documentation
## Leave Management System

**Base URL:** `http://localhost:8000/api`  
**Version:** 1.0  
**Date:** June 2026  

---

## Authentication

All endpoints except `POST /api/auth/login` require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message"
}
```

**Standard HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Internal Server Error |

---

## 1. Authentication & Onboarding
Endpoints for secure login, OAuth, and lead provisioning.

### 1.1 POST `/api/auth/login`
Authenticates a registered employee and returns a JWT.
**Roles:** Public
**Request:**
```json
{
  "email": "user@company.com",
  "password": "securepassword"
}
```
**Response (200 OK):**
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "role": "employee",
    "organization_id": "uuid"
  }
}
```

### 1.2 POST `/api/auth/oauth`
Authenticates via Google/Facebook.
**Roles:** Public
**Request:**
```json
{
  "provider": "google",
  "token": "ya29.a0A..."
}
```

### 1.3 POST `/api/onboarding/apply`
Submits a company application after initial OAuth/Email registration.
**Roles:** Authenticated (Unprovisioned Lead)
**Request:**
```json
{
  "company_name": "Acme Corp",
  "size": "50-100",
  "requirements": "Need approval chains"
}
```
**Response (201 Created):**
```json
{
  "message": "Application submitted successfully. Our team will review and provision your workspace."
}
```

---

## 2. Leave Endpoints

### POST `/api/leaves`

Apply for a new leave.

**Access:** 👤 Employee, 👔 Manager, 🛡️ Admin

**Request Body:**
```json
{
  "leave_type": "casual",
  "start_date": "2026-06-15",
  "end_date": "2026-06-17",
  "reason": "Family event"
}
```

**Success Response (201):**
```json
{
  "message": "Leave application submitted successfully",
  "leave": {
    "id": 10,
    "employee_id": 1,
    "leave_type": "casual",
    "start_date": "2026-06-15",
    "end_date": "2026-06-17",
    "reason": "Family event",
    "status": "pending",
    "days": 3,
    "created_at": "2026-06-01T10:30:00Z"
  }
}
```

**Error Responses:**
| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Missing fields | `{"error": "All fields are required: leave_type, start_date, end_date, reason"}` |
| 400 | Invalid date range | `{"error": "End date must be on or after start date"}` |
| 400 | Past date | `{"error": "Start date cannot be in the past"}` |
| 400 | Overlapping leave | `{"error": "You have an overlapping leave request for these dates"}` |
| 400 | Insufficient balance | `{"error": "Insufficient casual leave balance. Available: 2 days"}` |

---

### GET `/api/leaves`

Get leave history for the current user.

**Access:** 👤 Employee, 👔 Manager, 🛡️ Admin

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | all | Filter: `pending`, `approved`, `rejected`, `cancelled` |
| `start_date` | string | — | Filter by leave start date (YYYY-MM-DD) |
| `end_date` | string | — | Filter by leave end date (YYYY-MM-DD) |
| `skip` | integer| 0 | Pagination offset |
| `limit` | integer| 100 | Maximum records to return (max 1000) |

**Success Response (200):**
```json
{
  "leaves": [
    {
      "id": 10,
      "leave_type": "casual",
      "start_date": "2026-06-15",
      "end_date": "2026-06-17",
      "reason": "Family event",
      "status": "approved",
      "days": 3,
      "created_at": "2026-06-01T10:30:00Z",
      "updated_at": "2026-06-02T09:00:00Z",
      "approval": {
        "manager_name": "Alice Manager",
        "action": "approved",
        "comments": "Approved. Enjoy!",
        "acted_at": "2026-06-02T09:00:00Z"
      }
    }
  ]
}
```

---

### GET `/api/leaves/balance`

Get leave balance for the current user.

**Access:** 👤 Employee, 👔 Manager, 🛡️ Admin

**Success Response (200):**
```json
{
  "balances": [
    { "leave_type": "casual", "total_days": 12, "used_days": 3, "remaining": 9 },
    { "leave_type": "sick", "total_days": 10, "used_days": 1, "remaining": 9 },
    { "leave_type": "earned", "total_days": 15, "used_days": 0, "remaining": 15 }
  ],
  "year": 2026
}
```

---

### PUT `/api/leaves/:id/cancel`

Cancel a pending leave request.

**Access:** 👤 Owner of the leave

**Success Response (200):**
```json
{
  "message": "Leave request cancelled successfully",
  "leave": {
    "id": 10,
    "status": "cancelled"
  }
}
```

**Error Responses:**
| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Not pending | `{"error": "Only pending leaves can be cancelled"}` |
| 403 | Not owner | `{"error": "You can only cancel your own leave requests"}` |
| 404 | Not found | `{"error": "Leave request not found"}` |

---

### GET `/api/leaves/pending`

Get pending leave requests from direct reports.

**Access:** 👔 Manager, 🛡️ Admin

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `skip` | integer| 0 | Pagination offset |
| `limit` | integer| 100 | Maximum records to return (max 1000) |

**Success Response (200):**
```json
{
  "pending": [
    {
      "id": 10,
      "employee_id": 1,
      "employee_name": "John Doe",
      "department": "Engineering",
      "leave_type": "casual",
      "start_date": "2026-06-15",
      "end_date": "2026-06-17",
      "reason": "Family event",
      "days": 3,
      "created_at": "2026-06-01T10:30:00Z"
    }
  ]
}
```

---

### PUT `/api/leaves/:id/approve`

Approve a pending leave request.

**Access:** 👔 Manager, 🛡️ Admin

**Request Body:**
```json
{
  "comments": "Approved. Enjoy your time off!"
}
```

**Success Response (200 OK):**
```json
{
  "id": 5,
  "action": "approved",
  "acted_at": "2024-05-15T14:35:00Z"
}
```

**Error Responses:**
| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Not pending | `{"error": "Only pending leaves can be approved"}` |
| 403 | Not the manager | `{"error": "You can only approve requests from your direct reports"}` |
| 404 | Not found | `{"error": "Leave request not found"}` |

---

### PUT `/api/leaves/:id/reject`

Reject a pending leave request.

**Access:** 👔 Manager, 🛡️ Admin

**Request Body:**
```json
{
  "comments": "Team is understaffed during this period. Please reschedule."
}
```

**Success Response (200):**
```json
{
  "message": "Leave request rejected",
  "leave": {
    "id": 10,
    "status": "rejected"
  }
}
```

**Error Responses:**
| Status | Condition | Response |
|--------|-----------|----------|
| 400 | No reason provided | `{"error": "Rejection reason is required"}` |
| 400 | Not pending | `{"error": "Only pending leaves can be rejected"}` |
| 403 | Not the manager | `{"error": "You can only reject requests from your direct reports"}` |

---

## 3. Dashboard Endpoints

### GET `/api/dashboard/stats`

Get dashboard statistics based on user role.

**Access:** 👤 Employee, 👔 Manager, 🛡️ Admin

**Success Response (200) — Employee:**
```json
{
  "role": "employee",
  "stats": {
    "total_requests": 8,
    "pending": 1,
    "approved": 5,
    "rejected": 2
  },
  "recent_leaves": [...],
  "balances": [...]
}
```

**Success Response (200) — Manager (additional fields):**
```json
{
  "role": "manager",
  "stats": { ... },
  "team_pending_count": 3,
  "team_on_leave_today": ["John Doe", "Jane Smith"],
  "recent_leaves": [...],
  "balances": [...]
}
```

**Success Response (200) — Admin (additional fields):**
```json
{
  "role": "admin",
  "stats": { ... },
  "org_stats": {
    "total_employees": 25,
    "total_requests_this_month": 12,
    "department_breakdown": [
      { "department": "Engineering", "count": 5 },
      { "department": "Marketing", "count": 3 }
    ],
    "monthly_trend": [
      { "month": "2026-01", "count": 10 },
      { "month": "2026-02", "count": 8 }
    ]
  }
}
```

---

## 4. Employee Management Endpoints

### GET `/api/employees`

List all employees.

**Access:** 🛡️ Admin

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search by name or email |
| `skip` | integer| 0 | Pagination offset |
| `limit` | integer| 100 | Maximum records to return (max 1000) |

**Success Response (200):**
```json
{
  "employees": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@company.com",
      "role": "employee",
      "department": "Engineering",
      "manager_name": "Alice Manager",
      "is_active": 1,
      "created_at": "2026-01-15T08:00:00Z"
    }
  ]
}
```

### PUT `/api/employees/:id`

Update an employee's details.

**Access:** 🛡️ Admin

**Request Body:**
```json
{
  "name": "John Updated",
  "role": "manager",
  "department": "Engineering",
  "manager_id": null
}
```

**Success Response (200):**
```json
{
  "message": "Employee updated successfully",
  "employee": { ... }
}
```

### DELETE `/api/employees/:id`

Deactivate an employee (soft delete).

**Access:** 🛡️ Admin

**Success Response (200):**
```json
{
  "message": "Employee deactivated successfully"
}
```

**Error Responses:**
| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Self-deletion | `{"error": "Cannot deactivate your own account"}` |
| 404 | Not found | `{"error": "Employee not found"}` |

---

## 5. System Settings & Holidays

### 5.1 GET `/api/settings`
Retrieves global company policies.
**Roles:** Employee, Manager, Admin, Super Admin

### 5.2 POST `/api/settings`
Updates a specific system setting.
**Roles:** Admin, Super Admin
**Request:**
```json
{
  "setting_key": "carry_forward_limit",
  "setting_value": "5"
}
```

### 5.3 GET `/api/holidays`
Lists all company holidays for the current year.
**Roles:** Employee, Manager, Admin, Super Admin

### 5.4 POST `/api/holidays`
Adds a new company holiday.
**Roles:** Admin, Super Admin
**Request:**
```json
{
  "name": "Independence Day",
  "date": "2024-07-04"
}
```

---

## 6. Dashboard Analytics/reports/organization`

View organization-wide reports and metrics.

```json
{
  "org_stats": {
    "total_employees": 150,
    "total_admins": 5,
    "total_leave_requests": 320,
    "approved_leaves": 290,
    "rejected_leaves": 30,
    "department_breakdown": [
      { "department": "Engineering", "employees": 45, "leaves": 120 },
      { "department": "Marketing", "employees": 20, "leaves": 35 }
    ]
  }
}
```

