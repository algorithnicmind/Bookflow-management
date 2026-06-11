# 🏢 Leaveflow Management System

### A Premium, Role-Based Enterprise Employee Leave Management Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

**Digitize your leave workflows** — from instant submissions to manager reviews — with secure role-based portals, automated validation constraints, beautiful dark-themed analytics, and structured database safety.

[🚀 Quick Start](#-quick-start) · [📖 Interactive Portals & UI](#-interactive-portals--ui) · [🏗️ Architecture & Data Model](#️-architecture--data-model) · [📊 System Workflows](#-system-workflows) · [🔌 API Directory](#-api-directory) · [📂 Codebase Directory](#-codebase-directory)

</div>

---

## ✨ Enterprise Portals by Role

The platform provides dedicated interfaces, operations, and dashboards tailored dynamically to four roles:

| Role | Access Level & Capabilities | Primary Screens & Features |
|:---:|---|---|
| 👑 **Super Admin** | **Platform Governance** <br/> Configures system-wide leave policy limits, registers administrative accounts, and generates organization-wide analytics reports. | System settings panel, admin registry portal, departmental distribution dashboards. |
| 🛡️ **Admin** | **Organizational Directory Management** <br/> Creates and manages employee accounts, assigns departments, updates manager-report hierarchies, and deactivates accounts. | Employee CRUD dashboard, global activity stats overview. |
| 👔 **Manager** | **Team Supervision** <br/> Audits, approves, or rejects pending leave requests from direct reports with commentary, and tracks team calendar availability. | Pending request manager queue, team availability overview grid. |
| 👤 **Employee** | **Personal Leave Sandbox** <br/> Applies for leaves (Casual, Sick, Earned, Maternity, Miscarriage, Unpaid) with real-time validation checks and cancels pending requests. | Interactive leave balance gauges, personal request history table, leave submission form. |

---

## 🎨 Interactive Portals & UI Mockups

Below are structural representations of the user interface screens, exhibiting the custom-designed **Dark Glassmorphism UI** (`#0a0b14` → `#0f1123`) using electric indigo, emerald, amber, and rose accents.

### 👤 Employee Dashboard Mockup
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  LEAVEFLOW SYSTEM  •  EMPLOYEE PORTAL                                        [👤 John]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  📊 Leave Balances (2026 Year Calendar)                                                │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐         │
│  │ 🏖 CASUAL LEAVE       │ │ 🏥 SICK LEAVE         │ │ 📅 EARNED LEAVE       │         │
│  │  12 Days Allocated    │ │  12 Days Allocated    │ │  18 Days Allocated    │         │
│  │  [■■■■■■□□□□□□] 50%   │ │  [■■■■■■■■■■□□] 83%   │ │  [■■■□□□□□□□□□□□□□] 16%  │         │
│  │  Remaining: 6 Days    │ │  Remaining: 2 Days    │ │  Remaining: 15 Days   │         │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────────┘         │
│                                                                                        │
│  📋 Recent Leave History                                           [+ Apply New Leave]  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Leave Type    Duration                     Days    Status        Actions         │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │ 🏖 Casual     Jun 15 - Jun 18, 2026        3 Days  ● Pending     [Cancel] [View] │  │
│  │ 🏥 Sick       May 10 - May 12, 2026        2 Days  ● Approved             [View] │  │
│  │ 📅 Earned     Apr 01 - Apr 05, 2026        4 Days  ● Rejected             [View] │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 👔 Manager Console Mockup
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  LEAVEFLOW SYSTEM  •  MANAGER PORTAL                                        [👔 Alice] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ⏳ Pending Approvals Queue                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Employee      Leave Type   Dates                   Duration   Reason      Status │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │ Jane Doe      🏖 Casual    Jun 18 - Jun 20, 2026   2 Days     Family Trip ⏳Pending│  │
│  │ John Smith    📅 Earned    Jul 01 - Jul 10, 2026   9 Days     Vacation    ⏳Pending│  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│  Selected: Jane Doe  ───  Leave Type: Casual  ───  Duration: 2 Days                    │  │
│  [💬 Enter optional comments or rejection reason here...                           ]  │
│  [ ✅ Approve Request ]                             [ ❌ Reject Request ]              │
│                                                                                        │
│  📅 Team Availability Grid (Current Week)                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Team Member   Mon 15     Tue 16     Wed 17     Thu 18     Fri 19                 │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │ Jane Doe      Active     Active     Active     [🏖 LEAVE]  [🏖 LEAVE]              │  │
│  │ John Smith    Active     Active     Active     Active     Active                 │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 🛡️ Administrative Directory Mockup
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  LEAVEFLOW SYSTEM  •  ADMINISTRATIVE CONTROL                                [🛡️ Admin]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  👥 Employee Directory                                                [+ Add Employee]  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Name           Email                 Role        Department      Status   Actions    │  │
│  ├──────────────────────────────────────────────────────────────────────────────────┤  │
│  │ John Doe       john@company.com      Employee    Engineering     ● Active [✏️] [🗑️]   │  │
│  │ Alice Manager  alice@company.com     Manager     Engineering     ● Active [✏️] [🗑️]   │  │
│  │ Jane Doe       jane@company.com      Employee    Design          ● Active [✏️] [🗑️]   │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  📊 System Stats Overview                                                              │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐                       │
│  │ Total Active Employees:  45 │ │ Active Out-of-Office Today: │                       │
│  │ Org Approved Leaves YTD: 214│ │ Pending Approvals in Queue: │                       │
│  └─────────────────────────────┘ └─────────────────────────────┘                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture & Data Model

Leaveflow Management System is built on a clean three-tier structure to isolate browser operations, business transaction gateways, and secure persistent layers.

### System Architecture Flowchart
```mermaid
graph TD
    %% Custom Styling
    classDef client fill:#1e1b4b,stroke:#4f46e5,stroke-width:2px,color:#fff;
    classDef proxy fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef backend fill:#1e293b,stroke:#64748b,stroke-width:2px,color:#fff;
    classDef db fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef security fill:#7f1d1d,stroke:#f43f5e,stroke-width:2px,color:#fff;

    Client["🌐 Next.js App Router Client<br/>(Tailored Dynamic Views)"]:::client
    Proxy["🛡️ Nginx Gateway / Reverse Proxy<br/>(SSL/TLS + Local Rate Limits)"]:::proxy
    API["⚙️ FastAPI REST Server<br/>(Business Logic Engine)"]:::backend
    DB["🗄️ PostgreSQL Database<br/>(ACID Transactions)"]:::db
    JWT["🔐 JWT Authentication & Guard<br/>(Role Middleware Check)"]:::security

    Client -->|HTTPS / JSON Requests| Proxy
    Proxy -->|Filtered Ports Clean Traffic| API
    API -->|Validates Token & Scope| JWT
    API -->|Async SQLAlchemy Query| DB

```

### Entity Relationship (ER) Schema
The relational database layer enforces schema-level constraints to prevent duplicate entries, overlapping intervals, and incorrect roles.
```mermaid
erDiagram
    EMPLOYEES {
        int id PK
        string name
        string email UK
        string password_hash
        string role "super_admin, admin, manager, employee"
        int manager_id FK
        string department
        boolean is_active
        datetime created_at
    }
    LEAVE_REQUESTS {
        int id PK
        int employee_id FK
        string leave_type "casual, sick, earned, maternity, miscarriage, unpaid"
        date start_date
        date end_date
        text reason
        string status "pending, approved, rejected, cancelled"
        datetime created_at
        datetime updated_at
    }
    LEAVE_APPROVALS {
        int id PK
        int leave_request_id FK
        int manager_id FK
        string action "approved, rejected"
        text comments
        datetime acted_at
    }
    LEAVE_BALANCES {
        int id PK
        int employee_id FK
        string leave_type "casual, sick, earned, maternity, miscarriage"
        int total_days
        int used_days
        int year
    }

    EMPLOYEES ||--o{ LEAVE_REQUESTS : "applies_for"
    EMPLOYEES ||--o{ LEAVE_BALANCES : "allocated"
    EMPLOYEES ||--o| EMPLOYEES : "reports_to"
    LEAVE_REQUESTS ||--o| LEAVE_APPROVALS : "receives_action"
    EMPLOYEES ||--o{ LEAVE_APPROVALS : "audits_and_decides"
```

---

## 📊 System Workflows

### 1. Login & Role-Based Navigation
When a user logs in, their credential details are checked, a stateless JWT is produced, and the client routes them to the appropriate portal interface:
```mermaid
flowchart TD
    classDef default fill:#111326,stroke:#4f46e5,stroke-width:1px,color:#e8ecf4;
    classDef primary fill:#4f46e5,stroke:#7c3aed,stroke-width:1px,color:#fff;
    classDef success fill:#065f46,stroke:#10b981,stroke-width:1px,color:#fff;
    classDef warning fill:#78350f,stroke:#f59e0b,stroke-width:1px,color:#fff;
    classDef danger fill:#7f1d1d,stroke:#f43f5e,stroke-width:1px,color:#fff;

    Start[🌐 Open Web App] --> Login[🔐 Login Page]:::primary
    Login --> Credentials[✍️ Enter Email & Password]
    Credentials --> AuthCheck{Verify API Authenticate}
    
    AuthCheck -->|Failed| FailMsg[❌ Show Bad Credentials]:::danger
    FailMsg --> Credentials
    
    AuthCheck -->|Success| TokenGen[🔐 Return JWT Token + Role]:::success
    TokenGen --> RoleSplit{Read User Role}
    
    RoleSplit -->|employee| EmpDash[👤 Employee Dashboard]
    RoleSplit -->|manager| MgrDash[👔 Manager Dashboard]
    RoleSplit -->|admin| AdminDash[🛡️ Admin Dashboard]
    RoleSplit -->|super_admin| SuperDash[👑 Super Admin Dashboard]
```

### 2. Leave Submission & Validation Cycle
When an employee applies for leave, the backend applies multiple strict validations before debiting balances and writing to database history:
```mermaid
flowchart TD
    classDef default fill:#111326,stroke:#4f46e5,stroke-width:1px,color:#e8ecf4;
    classDef primary fill:#4f46e5,stroke:#7c3aed,stroke-width:1px,color:#fff;
    classDef success fill:#065f46,stroke:#10b981,stroke-width:1px,color:#fff;
    classDef warning fill:#78350f,stroke:#f59e0b,stroke-width:1px,color:#fff;
    classDef danger fill:#7f1d1d,stroke:#f43f5e,stroke-width:1px,color:#fff;

    Init[📊 Employee Dashboard] --> Action[🖱️ Click Apply Leave]
    Action --> Form[📋 Fill Request Details]:::primary
    Form --> ValidRange{Is End Date >= Start Date?}
    
    ValidRange -->|No| ErrRange[❌ Invalid Date Range]:::danger
    ErrRange --> Form
    
    ValidRange -->|Yes| ValidToday{Is Start Date >= Today?}
    
    ValidToday -->|No| ErrPast[❌ Start Date cannot be in Past]:::danger
    ErrPast --> Form
    
    ValidToday -->|Yes| OverlapCheck{Is Calendar Free?<br/>No Overlapping Leaves}
    
    OverlapCheck -->|No| ErrOverlap[❌ Overlapping request exists]:::danger
    ErrOverlap --> Form
    
    OverlapCheck -->|Yes| BalanceCheck{Leave Unpaid OR<br/>Has Balance >= Requested?}
    
    BalanceCheck -->|No| ErrBalance[❌ Insufficient Leave Balance]:::danger
    ErrBalance --> Form
    
    BalanceCheck -->|Yes| Deduct[⚖️ Deduct Balance - Increment Used Days]:::warning
    Deduct --> Submit[📝 Write Leave Request - Status: PENDING]:::success
    Submit --> Notify[👔 Notify Supervising Manager]
```

### 3. Manager Approval & Balance Restoration
A supervisor audits the leaves from direct reports. If approved, the status is finalized. If rejected, the balance is restored to the employee automatically:
```mermaid
flowchart TD
    classDef default fill:#111326,stroke:#4f46e5,stroke-width:1px,color:#e8ecf4;
    classDef primary fill:#4f46e5,stroke:#7c3aed,stroke-width:1px,color:#fff;
    classDef success fill:#065f46,stroke:#10b981,stroke-width:1px,color:#fff;
    classDef warning fill:#78350f,stroke:#f59e0b,stroke-width:1px,color:#fff;
    classDef danger fill:#7f1d1d,stroke:#f43f5e,stroke-width:1px,color:#fff;

    Start[📊 Manager Dashboard] --> Queue[📋 View Pending Requests]:::primary
    Queue --> Detail[📄 Open Request Details]
    Detail --> Decision{Approve or Reject?}
    
    Decision -->|Approve| AppComment[💬 Add Optional Comments]
    AppComment --> SaveApp[✅ Status -> APPROVED]:::success
    SaveApp --> LogApp[📝 Create LeaveApproval Row]
    
    Decision -->|Reject| RejComment[💬 Add Mandatory Reason]:::danger
    RejComment --> SaveRej[❌ Status -> REJECTED]:::danger
    SaveRej --> Restore[🔄 Restore Balance - Decrement Used Days]:::warning
    Restore --> LogRej[📝 Create LeaveApproval Row]
    
    LogApp --> ClientUpdate[👤 Employee Views Updated History]
    LogRej --> ClientUpdate
```

---

## 🔌 API Directory

| Endpoint | Method | Security Level / Role Scope | Description |
|:---|:---:|:---|:---|
| `/api/auth/login` | `POST` | Public | Authenticates credentials and returns dynamic role JSON + Bearer JWT. |
| `/api/auth/register` | `POST` | `super_admin`, `admin` | Registers new administrator and managers in the database directory. |
| `/api/employees` | `GET` | `super_admin`, `admin` | Retrieves organizational directory, filters by search query. |
| `/api/employees` | `POST` | `super_admin`, `admin` | Inserts a new employee profile and generates default leave balances. |
| `/api/employees/{id}` | `PUT` | `super_admin`, `admin` | Updates employee demographics, manager ID, and roles. |
| `/api/employees/{id}` | `DELETE` | `super_admin`, `admin` | Sets `is_active = False` to prevent user login and clear hierarchies. |
| `/api/leaves` | `POST` | Authenticated (All) | Submits a leave request, checks rules, and debits balances. |
| `/api/leaves` | `GET` | Authenticated (All) | Fetches the employee's personal leave requests history. |
| `/api/leaves/balance` | `GET` | Authenticated (All) | Retrieves active leave type balances (Total, Used, Remaining). |
| `/api/leaves/{id}/cancel` | `PUT` | Authenticated (All) | Cancels pending request and refunds allocated days. |
| `/api/leaves/pending` | `GET` | `super_admin`, `admin`, `manager` | Returns outstanding requests (scoped by manager ID or org-wide). |
| `/api/leaves/{id}/approve`| `PUT` | `super_admin`, `admin`, `manager` | Approves request, adds comment, logs approval details. |
| `/api/leaves/{id}/reject` | `PUT` | `super_admin`, `admin`, `manager` | Rejects request, requires rejection reason, refunds balance. |
| `/api/dashboard/stats` | `GET` | Authenticated (All) | Computes role-specific counters, charts, and metadata. |
| `/api/reports/organization`| `GET` | `super_admin` | Generates breakdown statistics by department and leave type. |
| `/api/settings` | `GET` | `super_admin` | Gets system-wide baseline leaves allocation configuration. |
| `/api/settings` | `PUT` | `super_admin` | Modifies global limits (Casual, Sick, Earned limits). |

---

## 📂 Codebase Directory

```text
Leaveflow-management/
│
├── 📁 client/                        # 🌐 Next.js App Router Frontend
│   ├── package.json                 #    Node packages configure
│   ├── next.config.js               #    Next.js configuration parameters
│   └── 📁 src/
│       ├── 📁 app/                  #    App Router folders (Pages & Layouts)
│       │   ├── page.js              #    Landing Page
│       │   ├── layout.js            #    Global HTML Layout
│       │   ├── 📁 apply-leave/      #    Employee apply leave screen
│       │   ├── 📁 dashboard/        #    Custom dynamic Home Dashboard
│       │   ├── 📁 employees/        #    Admin Employee CRUD controller
│       │   ├── 📁 leave-history/    #    Employee list of requests
│       │   ├── 📁 login/            #    Login Form
│       │   ├── 📁 manage-admins/    #    Super admin portal settings
│       │   ├── 📁 organization-reports/  # Organization performance stats
│       │   ├── 📁 pending-requests/ #    Manager approval portal
│       │   ├── 📁 system-settings/  #    Super admin setup variables
│       │   └── 📁 team-overview/    #    Manager direct report calendar
│       ├── 📁 components/           #    Reusable Glassmorphic elements
│       ├── 📁 context/              #    Global Contexts (AuthContext provider)
│       ├── 📁 lib/                  #    Shared helpers and constants
│       ├── 📁 services/             #    Frontend API client integrations
│       └── app.css                  #    Unified Design System styling
│
├── 📁 server/                        # 🐍 Python REST API (FastAPI Backend)
│   ├── main.py                      #    Coordinator entrypoint & Demo Auto-seeding
│   ├── requirements.txt             #    Pip dependencies
│   ├── 📁 app/
│   │   ├── 📁 core/                 #    Cross-cutting configurations
│   │   │   ├── config.py            #    Environment Variable settings
│   │   │   ├── database.py          #    Async Session and engine configuration
│   │   │   ├── dependencies.py      #    JWT validation and role checker filters
│   │   │   └── security.py          #    Bcrypt utilities
│   │   └── 📁 modules/              #    Feature modules (Repository-Service Pattern)
│   │       ├── 📁 auth/             #    User authorization services
│   │       ├── 📁 dashboard/        #    Consolidated dashboard API
│   │       ├── 📁 employees/        #    Staff directory services
│   │       ├── 📁 leaves/           #    Core leave engines
│   │       ├── 📁 reports/          #    Super admin org statistics
│   │       └── 📁 settings/         #    Global limit settings
│   └── 📁 db/
│       └── seed.py                  #    Database seeder script (Drop & Rebuilds schema)
│
├── 📁 docs/                          # 📖 Detailed Architectural Docs
└── README.md                         # ← You are here!
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) v3.10+
- [PostgreSQL](https://www.postgresql.org/) v15+

### Installation & Launch

#### 1. Setup the Database
Create a new Postgres instance:
```bash
createdb leave_management
```

#### 2. Startup Backend API (FastAPI)
```bash
# Enter server directory
cd server

# Setup virtual environment
python -m venv venv

# Activate Virtual Environment:
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# Install package dependencies
pip install -r requirements.txt

# Configure environment settings:
# Create a .env file and set DATABASE_URL (Async pg driver) + JWT_SECRET
# e.g., DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/leave_management
# e.g., JWT_SECRET=supersecretkeyshouldbechangedinproduction

# Run database seeder (seeds all default test credentials below)
python db/seed.py

# Launch FastAPI ASGI dev server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Startup Frontend (Next.js)
```bash
# Open a new terminal in the project root directory
cd client

# Install packages
npm install

# Configure environment settings:
# Create a .env.local file and set NEXT_PUBLIC_API_URL
# e.g., NEXT_PUBLIC_API_URL=http://localhost:8000

# Launch Next.js dev server
npm run dev
```

### 🌐 Ports & Documentation
- **Next.js Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI Base API**: [http://localhost:8000/api](http://localhost:8000/api)

---

## 🔑 Demo Credentials

All passwords default to `password123`. You can reset the database and seed these accounts by running `python db/seed.py`.

| Role | Email | Password | Scope & Responsibilities |
|:---:|---|:---:|---|
| 👑 **Super Admin** | `superadmin@company.com` | `password123` | Configures system-wide settings, reviews organization charts. |
| 🛡️ **Admin** | `admin@company.com` | `password123` | Adds/modifies employee directory entries and manager links. |
| 👔 **Manager** | `alice@company.com` | `password123` | Engineering manager (direct reports: John Doe). |
| 👔 **Manager** | `bob@company.com` | `password123` | Design manager (direct reports: Jane Doe). |
| 👤 **Employee** | `john@company.com` | `password123` | Applies for leaves, reports to Alice. |
| 👤 **Employee** | `jane@company.com` | `password123` | Applies for leaves, reports to Bob. |

---

## 🛡️ Security Implementations

* **Gateway Shields**: Built-in CORS configuration to restrict backend resource consumption to authorized client Origins.
* **Stateless Auth**: Enforces JWT token authorization filters with Bcrypt cryptography hashing for login keys.
* **Parameter Validation**: Restricts SQL injection vulnerability using async SQLAlchemy parameterized queries.
* **Business Safe Rails**: Employs backend check boundaries and schema Constraints to lock leave applications against invalid dates, overlaps, and negative balances.