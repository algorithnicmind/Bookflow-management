# Low Level Design (LLD)
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    EMPLOYEES {
        SERIAL id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR role
        INTEGER manager_id FK
        VARCHAR department
        BOOLEAN is_active
        TIMESTAMP created_at
    }
    
    LEAVE_REQUESTS {
        SERIAL id PK
        INTEGER employee_id FK
        VARCHAR leave_type
        DATE start_date
        DATE end_date
        TEXT reason
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    LEAVE_APPROVALS {
        SERIAL id PK
        INTEGER leave_request_id FK
        INTEGER manager_id FK
        VARCHAR action
        TEXT comments
        TIMESTAMP acted_at
    }
    
    LEAVE_BALANCES {
        SERIAL id PK
        INTEGER employee_id FK
        VARCHAR leave_type
        INTEGER total_days
        INTEGER used_days
        INTEGER year
    }
    
    EMPLOYEES ||--o{ LEAVE_REQUESTS : "applies for"
    EMPLOYEES ||--o{ LEAVE_BALANCES : "has"
    EMPLOYEES ||--o{ EMPLOYEES : "manages"
    LEAVE_REQUESTS ||--o| LEAVE_APPROVALS : "reviewed in"
    EMPLOYEES ||--o{ LEAVE_APPROVALS : "reviews"
```

---

## 2. Database Schema (PostgreSQL)

### 2.1 `employees` Table

Stores all user accounts — employees, managers, and admins.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique employee ID (auto-increment) |
| `name` | VARCHAR(100) | NOT NULL | Full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `role` | VARCHAR(20) | NOT NULL, CHECK(role IN ('employee','manager','admin')) | System role |
| `manager_id` | INTEGER | REFERENCES employees(id), NULLABLE | Reporting manager (NULL for admins) |
| `department` | VARCHAR(100) | NOT NULL, DEFAULT 'General' | Department name |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Active / deactivated |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |

**Indexes:**
- `idx_employees_email` on `email`
- `idx_employees_manager_id` on `manager_id`
- `idx_employees_role` on `role`

---

### 2.2 `leave_requests` Table

Stores every leave application submitted by employees.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique leave request ID (auto-increment) |
| `employee_id` | INTEGER | NOT NULL, REFERENCES employees(id) ON DELETE CASCADE | Applicant |
| `leave_type` | VARCHAR(20) | NOT NULL, CHECK(leave_type IN ('casual','sick','earned','unpaid')) | Type of leave |
| `start_date` | DATE | NOT NULL | Leave start (YYYY-MM-DD) |
| `end_date` | DATE | NOT NULL | Leave end (YYYY-MM-DD) |
| `reason` | TEXT | NOT NULL | Reason for leave |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK(status IN ('pending','approved','rejected','cancelled')) | Current status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Application timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last status change |

**Indexes:**
- `idx_leaves_employee_id` on `employee_id`
- `idx_leaves_status` on `status`
- `idx_leaves_dates` on `start_date, end_date`

---

### 2.3 `leave_approvals` Table

Records manager actions on leave requests (audit trail).

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique approval record ID (auto-increment) |
| `leave_request_id` | INTEGER | NOT NULL, REFERENCES leave_requests(id) ON DELETE CASCADE | Associated leave request |
| `manager_id` | INTEGER | NOT NULL, REFERENCES employees(id) | Acting manager |
| `action` | VARCHAR(20) | NOT NULL, CHECK(action IN ('approved','rejected')) | Action taken |
| `comments` | TEXT | NULLABLE | Manager comments/reason |
| `acted_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp |

**Indexes:**
- `idx_approvals_leave_id` on `leave_request_id`
- `idx_approvals_manager_id` on `manager_id`

---

### 2.4 `leave_balances` Table

Tracks leave quota per employee per leave type per year.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique balance record ID (auto-increment) |
| `employee_id` | INTEGER | NOT NULL, REFERENCES employees(id) ON DELETE CASCADE | Employee |
| `leave_type` | VARCHAR(20) | NOT NULL, CHECK(leave_type IN ('casual','sick','earned')) | Leave type (unpaid has no balance) |
| `total_days` | INTEGER | NOT NULL | Total allocated for the year |
| `used_days` | INTEGER | NOT NULL, DEFAULT 0 | Days used so far |
| `year` | INTEGER | NOT NULL | Calendar year |

**Constraints:**
- UNIQUE(`employee_id`, `leave_type`, `year`)

**Indexes:**
- `idx_balances_employee_year` on `employee_id, year`

---

## 3. SQL Schema Definition (PostgreSQL)

```sql
-- ============================================
-- Leave Management System — PostgreSQL Schema
-- ============================================

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'manager', 'admin')),
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    department VARCHAR(100) NOT NULL DEFAULT 'General',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leave approvals table (audit trail)
CREATE TABLE IF NOT EXISTS leave_approvals (
    id SERIAL PRIMARY KEY,
    leave_request_id INTEGER NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    manager_id INTEGER NOT NULL REFERENCES employees(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
    comments TEXT,
    acted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leave balances table
CREATE TABLE IF NOT EXISTS leave_balances (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned')),
    total_days INTEGER NOT NULL,
    used_days INTEGER NOT NULL DEFAULT 0,
    year INTEGER NOT NULL,
    UNIQUE(employee_id, leave_type, year)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_leaves_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_approvals_leave_id ON leave_approvals(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_approvals_manager_id ON leave_approvals(manager_id);
CREATE INDEX IF NOT EXISTS idx_balances_employee_year ON leave_balances(employee_id, year);

-- Optional: Auto-update updated_at on leave_requests
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

---

## 4. Module Detailed Design

### 4.1 Auth Middleware (`middleware/auth.js`)

```
Function: authenticateToken(req, res, next)
├── Extract JWT from "Authorization: Bearer <token>"
├── If no token → 401 Unauthorized
├── Verify token with secret key
├── If invalid/expired → 403 Forbidden
├── Attach user { id, email, role } to req.user
└── Call next()

Function: requireRole(...roles)
├── Returns middleware function
├── Check if req.user.role is in allowed roles
├── If not → 403 Forbidden
└── Call next()
```

### 4.2 Leave Business Logic (`routes/leaves.js`)

```
Function: applyLeave(employeeId, leaveData)
├── Validate required fields (type, startDate, endDate, reason)
├── Validate endDate >= startDate
├── Validate startDate >= today
├── Check for overlapping leaves (pending/approved)
│   └── SELECT FROM leave_requests WHERE employee_id = ? 
│       AND status IN ('pending', 'approved')
│       AND start_date <= ? AND end_date >= ?
├── If leave_type != 'unpaid':
│   ├── Calculate business days
│   ├── Check leave_balances for sufficient remaining
│   └── Deduct from balance
├── INSERT INTO leave_requests
└── Return created leave

Function: approveLeave(managerId, leaveId)
├── Fetch leave request
├── Verify status is 'pending'
├── Verify managerId is the employee's manager
├── UPDATE leave_requests SET status = 'approved'
├── INSERT INTO leave_approvals
└── Return updated leave

Function: rejectLeave(managerId, leaveId, reason)
├── Fetch leave request
├── Verify status is 'pending'
├── Verify managerId is the employee's manager
├── UPDATE leave_requests SET status = 'rejected'
├── Restore leave balance (if paid leave)
├── INSERT INTO leave_approvals
└── Return updated leave
```

### 4.3 Dashboard Stats (`routes/dashboard.js`)

```
Function: getStats(userId, role)
├── If role == 'employee':
│   ├── Leave balance summary
│   ├── Recent requests (last 5)
│   └── Status counts (pending, approved, rejected)
├── If role == 'manager':
│   ├── Pending approval count
│   ├── Team members on leave today
│   └── Team leave summary
├── If role == 'admin':
│   ├── Organization-wide status counts
│   ├── Department-wise breakdown
│   ├── Monthly trend (last 6 months)
│   └── Employee count by role
└── Return stats object
```

---

## 5. Frontend Module Design (React.js)

### 5.1 React Component Architecture

```
src/
├── App.jsx                  ← Root component + React Router
├── main.jsx                 ← Vite entry point
├── index.css                ← Global design system
├── context/
│   └── AuthContext.jsx      ← JWT auth state (React Context)
├── services/
│   └── api.js               ← Axios instance with JWT interceptor
├── components/
│   ├── Layout/
│   │   ├── Sidebar.jsx      ← Navigation sidebar
│   │   └── Header.jsx       ← Top bar with user info + logout
│   ├── UI/
│   │   ├── Card.jsx         ← Glassmorphism card
│   │   ├── Button.jsx       ← Button variants
│   │   ├── Badge.jsx        ← Status badges
│   │   ├── Modal.jsx        ← Dialog overlay
│   │   └── StatCard.jsx     ← Dashboard stat card
│   └── ProtectedRoute.jsx   ← Role-based route guard
└── pages/
    ├── Login.jsx             ← Login form
    ├── Dashboard.jsx         ← Role-based dashboard
    ├── ApplyLeave.jsx        ← Leave application form
    ├── LeaveHistory.jsx      ← Leave request table
    ├── PendingRequests.jsx   ← Manager approval queue
    └── Employees.jsx         ← Admin employee CRUD
```

### 5.2 React Router Configuration (`App.jsx`)

```
Routes:
├── /login → <Login /> (public)
├── / → <ProtectedRoute> (redirect based on role)
│   ├── /dashboard → <Dashboard />
│   ├── /apply-leave → <ApplyLeave />
│   ├── /leave-history → <LeaveHistory />
│   ├── /pending-requests → <PendingRequests /> (manager+)
│   ├── /employees → <Employees /> (admin only)
│   └── * → redirect to /dashboard
└── ProtectedRoute checks JWT + role before rendering
```

### 5.3 API Service Layer (`services/api.js`)

```
Axios Instance:
├── baseURL: http://localhost:3000/api
├── Interceptor (request):
│   └── Attach Authorization: Bearer <token> header
├── Interceptor (response):
│   ├── 401 → clear token, redirect to /login
│   └── Return response.data
└── Exported methods: api.get(), api.post(), api.put(), api.delete()
```

### 5.4 CSS Design System (`index.css`)

```
Design Tokens:
├── Colors: Navy dark mode palette, accent colors
├── Typography: Inter font (Google Fonts), size scale
├── Spacing: 4px base unit scale
├── Borders: Radius scale (8px inputs, 12px cards)
├── Shadows: Multi-layer elevation levels
└── Animations: Transitions, keyframes, micro-interactions

Component Classes:
├── .card — Glassmorphism container (backdrop-blur)
├── .btn — Button variants (primary, success, danger)
├── .input — Form inputs with floating labels & focus states
├── .table — Data table with hover rows
├── .badge — Color-coded status indicators
├── .sidebar — Collapsible navigation sidebar
├── .stat-card — Dashboard statistic card with progress rings
└── .modal — Overlay dialog with backdrop
```
