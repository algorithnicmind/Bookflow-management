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

## ✨ Dynamic Roles & Enterprise Portals

The platform features a completely **Dynamic Role Architecture**. Organizations can create custom roles mapped to fixed system permissions (e.g., `manage_settings`, `manage_employees`, `approve_leaves`). Typical configurations map to the following core personas:

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
    
    AuthCheck -->|Success| TokenGen[🔐 Return JWT Token + Permissions]:::success
    TokenGen --> RoleSplit{Check User Permissions}
    
    RoleSplit -->|Basic Auth| EmpDash[👤 Employee Dashboard]
    RoleSplit -->|approve_leaves| MgrDash[👔 Manager Dashboard]
    RoleSplit -->|manage_settings| AdminDash[🛡️ Admin Dashboard]
    RoleSplit -->|Tenant Owner| SuperDash[👑 Super Admin Dashboard]
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
├── 📁 client/                                           # Next.js App Router Frontend - Contains all user interface code
│   ├── 📁 __tests__/                                    # Directory
│   │   ├── 📁 app/                                      # Next.js App Router folders (Pages & Layouts)
│   │   │   ├── 📁 apply-leave/                          # Directory
│   │   │   │   └── page.test.js                        # Frontend unit/integration tests
│   │   │   ├── 📁 dashboard/                            # Directory
│   │   │   │   └── page.test.js                        # Frontend unit/integration tests
│   │   │   └── 📁 login/                                # Directory
│   │   │       └── page.test.js                        # Frontend unit/integration tests
│   │   ├── 📁 context/                                  # Directory
│   │   │   ├── AuthContext.test.js                     # Frontend unit/integration tests
│   │   │   └── NotificationContex...                   # Project file
│   │   ├── 📁 lib/                                      # Shared utility functions and helpers
│   │   │   └── utils.test.js                           # Frontend unit/integration tests
│   │   └── 📁 services/                                 # API client integrators for fetching backend data
│   │       └── api.test.js                             # Frontend unit/integration tests
│   ├── 📁 public/                                       # Static assets like images and favicons
│   │   ├── assets                                      # Project file
│   │   ├── favicon.ico                                 # Project file
│   │   ├── favicon.png                                 # Project file
│   │   └── logo.png                                    # Project file
│   ├── 📁 src/                                          # Source code root for the frontend
│   │   ├── 📁 app/                                      # Next.js App Router folders (Pages & Layouts)
│   │   │   ├── 📁 (protected)/                          # Protected routes requiring authentication
│   │   │   │   ├── 📁 apply-leave/                      # Directory
│   │   │   │   │   └── page.js                         # Form page for submitting leave requests
│   │   │   │   ├── 📁 audit-logs/                       # Directory
│   │   │   │   │   └── page.js                         # Next.js page route component
│   │   │   │   ├── 📁 dashboard/                        # Directory
│   │   │   │   │   └── page.js                         # Main dashboard view with stats
│   │   │   │   ├── 📁 employees/                        # Directory
│   │   │   │   │   └── page.js                         # Next.js page route component
│   │   │   │   ├── 📁 leads/                            # Directory
│   │   │   │   │   ├── 📁 [id]/                         # Directory
│   │   │   │   │   │   └── page.js                     # Next.js page route component
│   │   │   │   │   └── page.js                         # Next.js page route component
│   │   │   │   ├── 📁 leave-history/                    # Directory
│   │   │   │   │   └── pa...                           # Project file
│   │   │   │   ├── 📁 manage-admins/                    # Directory
│   │   │   │   │   └── pa...                           # Project file
│   │   │   │   ├── 📁 organizations/                    # Directory
│   │   │   │   │   ├── [i...                           # Project file
│   │   │   │   │   ├── [id]                            # Project file
│   │   │   │   │   └── pa...                           # Project file
│   │   │   │   ├── 📁 owner-contacts/                   # Directory
│   │   │   │   │   └── p...                            # Project file
│   │   │   │   ├── 📁 platform-owners/                  # Directory
│   │   │   │   │   └── ...                             # Project file
│   │   │   │   ├── 📁 system-settings/                  # Directory
│   │   │   │   │   └── ...                             # Project file
│   │   │   │   ├── 📁 team-overview/                    # Directory
│   │   │   │   │   └── pa...                           # Project file
│   │   │   │   ├── 📁 tenants/                          # Directory
│   │   │   │   │   ├── 📁 [id]/                         # Directory
│   │   │   │   │   │   ├── das...                      # Project file
│   │   │   │   │   │   └── pag...                      # Project file
│   │   │   │   │   └── page.js                         # Next.js page route component
│   │   │   │   ├── account-settings                    # Project file
│   │   │   │   ├── account-settings...                 # Project file
│   │   │   │   ├── layout.js                           # Next.js layout wrapper for consistent UI
│   │   │   │   ├── organization-rep...                 # Project file
│   │   │   │   ├── pending-requests                    # Project file
│   │   │   │   └── pending-requests...                 # Project file
│   │   │   ├── 📁 login/                                # Directory
│   │   │   │   └── page.js                             # Login screen for all users
│   │   │   ├── layout.js                               # Next.js layout wrapper for consistent UI
│   │   │   └── page.js                                 # Next.js page route component
│   │   ├── 📁 components/                               # Reusable React components
│   │   │   ├── 📁 Chatbot/                              # Directory
│   │   │   │   ├── ChatInput.js                        # JavaScript source code
│   │   │   │   ├── Chatbot.js                          # JavaScript source code
│   │   │   │   ├── ChatbotHeader.js                    # JavaScript source code
│   │   │   │   ├── FloatingButto...                    # Project file
│   │   │   │   ├── MessageList.js                      # JavaScript source code
│   │   │   │   └── SuggestionChi...                    # Project file
│   │   │   ├── 📁 Landing/                              # Directory
│   │   │   │   ├── ContactSectio...                    # Project file
│   │   │   │   ├── FeatureGrid.js                      # JavaScript source code
│   │   │   │   ├── FloatingNav.js                      # JavaScript source code
│   │   │   │   ├── HeroSection.js                      # JavaScript source code
│   │   │   │   ├── PricingSectio...                    # Project file
│   │   │   │   └── SolutionsSect...                    # Project file
│   │   │   ├── 📁 Layout/                               # Directory
│   │   │   │   ├── 📁 Header/                           # Directory
│   │   │   │   │   ├── Notific...                      # Project file
│   │   │   │   │   ├── Organiz...                      # Project file
│   │   │   │   │   ├── Profile...                      # Project file
│   │   │   │   │   └── ThemeTo...                      # Project file
│   │   │   │   ├── Header.js                           # JavaScript source code
│   │   │   │   ├── LiveClock.js                        # JavaScript source code
│   │   │   │   ├── Sidebar.js                          # JavaScript source code
│   │   │   │   └── index.js                            # JavaScript source code
│   │   │   ├── 📁 shared/                               # Directory
│   │   │   │   ├── LeaveTypeIcon.js                    # JavaScript source code
│   │   │   │   └── index.js                            # JavaScript source code
│   │   │   ├── 📁 ui/                                   # Atomic UI components (Buttons, Cards, Modals)
│   │   │   │   ├── Badge.js                            # JavaScript source code
│   │   │   │   ├── Button.js                           # Reusable Button component
│   │   │   │   ├── Card.js                             # Reusable Card container component
│   │   │   │   ├── Modal.js                            # Reusable Modal dialog component
│   │   │   │   ├── StatCard.js                         # JavaScript source code
│   │   │   │   └── index.js                            # JavaScript source code
│   │   │   ├── AppleEmoji.js                           # JavaScript source code
│   │   │   ├── ErrorBoundary.js                        # JavaScript source code
│   │   │   ├── LeadModal.js                            # JavaScript source code
│   │   │   ├── OnboardingModal.js                      # JavaScript source code
│   │   │   └── index.js                                # JavaScript source code
│   │   ├── 📁 config/                                   # Directory
│   │   │   ├── constants.js                            # JavaScript source code
│   │   │   ├── index.js                                # JavaScript source code
│   │   │   └── navigation.js                           # JavaScript source code
│   │   ├── 📁 context/                                  # Directory
│   │   │   ├── NotificationContext.js                  # JavaScript source code
│   │   │   └── index.js                                # JavaScript source code
│   │   ├── 📁 features/                                 # Domain-specific feature modules (e.g., auth, leaves)
│   │   │   ├── 📁 audit/                                # Directory
│   │   │   │   └── AuditLogsPage.js                    # JavaScript source code
│   │   │   ├── 📁 auth/                                 # Authentication, login, and authorization logic
│   │   │   │   ├── 📁 login/                            # Authentication, login, and authorization logic
│   │   │   │   │   └── LoginForm.js                    # JavaScript source code
│   │   │   │   ├── AuthContext.js                      # Global React context for managing user session
│   │   │   │   ├── AuthGuard.js                        # JavaScript source code
│   │   │   │   └── index.js                            # JavaScript source code
│   │   │   ├── 📁 contact/                              # Directory
│   │   │   │   └── OwnerContactsPa...                  # Project file
│   │   │   ├── 📁 dashboard/                            # Dashboard stats and widgets
│   │   │   │   ├── DashboardPage.js                    # JavaScript source code
│   │   │   │   └── components                          # Project file
│   │   │   ├── 📁 employees/                            # Employee directory and management
│   │   │   │   ├── EmployeesPage.js                    # JavaScript source code
│   │   │   │   ├── ManageAdminsP...                    # Project file
│   │   │   │   └── TeamOverviewP...                    # Project file
│   │   │   ├── 📁 leads/                                # Directory
│   │   │   │   ├── LeadDetailsPage.js                  # JavaScript source code
│   │   │   │   └── LeadsPage.js                        # JavaScript source code
│   │   │   ├── 📁 leaves/                               # Leave request creation and management
│   │   │   │   ├── 📁 apply/                            # Leave request creation and management
│   │   │   │   │   └── ApplyLeave...                   # Project file
│   │   │   │   ├── 📁 history/                          # Leave request creation and management
│   │   │   │   │   └── LeaveHis...                     # Project file
│   │   │   │   └── 📁 pending/                          # Leave request creation and management
│   │   │   │       └── PendingR...                     # Project file
│   │   │   ├── 📁 organizations/                        # Tenant organization management (Platform Owner)
│   │   │   │   └── Organizat...                        # Project file
│   │   │   ├── 📁 platform-owners/                      # Directory
│   │   │   │   └── Platfor...                          # Project file
│   │   │   ├── 📁 reports/                              # Directory
│   │   │   │   └── OrganizationRep...                  # Project file
│   │   │   ├── 📁 settings/                             # System configuration settings
│   │   │   │   ├── AccountSetting...                   # Project file
│   │   │   │   └── SystemSettings...                   # Project file
│   │   │   └── 📁 tenants/                              # Tenant provisioning and onboarding
│   │   │       ├── TenantDashboard...                  # Project file
│   │   │       ├── TenantDetailsPa...                  # Project file
│   │   │       └── TenantsPage.js                      # JavaScript source code
│   │   ├── 📁 hooks/                                    # Directory
│   │   │   ├── index.js                                # JavaScript source code
│   │   │   └── useTheme.js                             # JavaScript source code
│   │   ├── 📁 lib/                                      # Shared utility functions and helpers
│   │   │   ├── constants.js                            # JavaScript source code
│   │   │   ├── index.js                                # JavaScript source code
│   │   │   └── utils.js                                # JavaScript source code
│   │   ├── 📁 services/                                 # API client integrators for fetching backend data
│   │   │   ├── api.js                                  # Centralized frontend API definitions connecting to backend
│   │   │   └── index.js                                # JavaScript source code
│   │   └── app.css                                     # Global application styling and Tailwind/CSS variables
│   ├── .env.local                                      # Project file
│   ├── .prettierrc                                     # Project file
│   ├── crop_favicon.js                                 # JavaScript source code
│   ├── jest.config.js                                  # JavaScript source code
│   ├── jest.setup.js                                   # JavaScript source code
│   ├── jsconfig.json                                   # JSON configuration data
│   ├── next-env.d.ts                                   # Project file
│   ├── next.config.js                                  # Next.js compilation and framework settings
│   ├── package-lock.json                               # JSON configuration data
│   ├── package.json                                    # Node dependencies and scripts
│   ├── postcss.config.mjs                              # Project file
│   ├── remove_bg.js                                    # JavaScript source code
│   ├── test-emojis.js                                  # JavaScript source code
│   └── tsconfig.json                                   # JSON configuration data
├── 📁 docs/                                             # Detailed Architectural and Planning Documentation
│   ├── 📁 task/                                         # Directory
│   │   └── task.md                                     # Markdown documentation file
│   ├── 01-PRD.md                                       # Markdown documentation file
│   ├── 02-TRD.md                                       # Markdown documentation file
│   ├── 03-User-Stories.md                              # Markdown documentation file
│   ├── 04-User-Flows.md                                # Markdown documentation file
│   ├── 05-HLD.md                                       # Markdown documentation file
│   ├── 06-LLD.md                                       # Markdown documentation file
│   ├── 06a-Database-Design.md                          # Markdown documentation file
│   ├── 07-API-Documentation.md                         # Markdown documentation file
│   ├── 08-Wireframes.md                                # Markdown documentation file
│   └── 10-Sprint-Tracker.md                            # Markdown documentation file
├── 📁 server/                                           # FastAPI Backend - Contains all business logic and database models
│   ├── 📁 app/                                          # Next.js App Router folders (Pages & Layouts)
│   │   ├── 📁 core/                                     # Cross-cutting backend configurations (DB, security)
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── config.py                               # Environment variable loading and configuration
│   │   │   ├── database.py                             # SQLAlchemy async database engine setup
│   │   │   ├── dependencies.py                         # Python source code
│   │   │   ├── security.py                             # Python source code
│   │   │   ├── tenant.py                               # Python source code
│   │   │   └── utils.py                                # Python source code
│   │   ├── 📁 modules/                                  # Backend feature modules (Repository-Service Pattern)
│   │   │   ├── 📁 audit/                                # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── models.py                           # SQLAlchemy ORM database table definitions
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   ├── schemas.py                          # Pydantic models for request/response validation
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 auth/                                 # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── repositories.py                     # Database querying and transaction layer
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   ├── schemas.py                          # Pydantic models for request/response validation
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 contact/                              # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── models.py                           # SQLAlchemy ORM database table definitions
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   └── schemas.py                          # Pydantic models for request/response validation
│   │   │   ├── 📁 dashboard/                            # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   ├── schemas.py                          # Pydantic models for request/response validation
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 employees/                            # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── models.py                           # SQLAlchemy ORM database table definitions
│   │   │   │   ├── repositories.py                     # Database querying and transaction layer
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   ├── schemas.py                          # Pydantic models for request/response validation
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 integrations/                         # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── calendar_se...                      # Project file
│   │   │   │   ├── models.py                           # SQLAlchemy ORM database table definitions
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 leaves/                               # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── cron.py                             # Python source code
│   │   │   │   ├── models.py                           # SQLAlchemy ORM database table definitions
│   │   │   │   ├── repositories.py                     # Database querying and transaction layer
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   ├── schemas.py                          # Pydantic models for request/response validation
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 notifications/                        # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── models.py                           # SQLAlchemy ORM database table definitions
│   │   │   │   └── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   ├── 📁 onboarding/                           # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── repositories.py                     # Database querying and transaction layer
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 organizations/                        # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── models.py                           # SQLAlchemy ORM database table definitions
│   │   │   │   ├── repositori...                       # Project file
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   ├── schemas.py                          # Pydantic models for request/response validation
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 reports/                              # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   └── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   ├── 📁 settings/                             # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   ├── models.py                           # SQLAlchemy ORM database table definitions
│   │   │   │   ├── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   │   ├── schemas.py                          # Pydantic models for request/response validation
│   │   │   │   └── services.py                         # Business logic and service layer
│   │   │   ├── 📁 uploads/                              # Directory
│   │   │   │   ├── __init__.py                         # Python source code
│   │   │   │   └── routes.py                           # FastAPI HTTP endpoint definitions
│   │   │   └── __init__.py                             # Python source code
│   │   └── __init__.py                                 # Python source code
│   ├── 📁 bot/                                          # AI Chatbot service for answering employee queries
│   │   ├── __init__.py                                 # Python source code
│   │   ├── actions.py                                  # Python source code
│   │   ├── llm.py                                      # Python source code
│   │   ├── policies.py                                 # Python source code
│   │   ├── router.py                                   # Python source code
│   │   ├── schemas.py                                  # Pydantic models for request/response validation
│   │   └── service.py                                  # Python source code
│   ├── 📁 migrations/                                   # Alembic database schema migration scripts
│   │   ├── 📁 versions/                                 # Directory
│   │   │   ├── c73b5aa6ffd4_rem...                     # Project file
│   │   │   └── f7304259f1a9_ini...                     # Project file
│   │   ├── README                                      # Project file
│   │   ├── env.py                                      # Python source code
│   │   └── script.py.mako                              # Project file
│   ├── .env                                            # Project file
│   ├── alembic.ini                                     # Project file
│   ├── main.py                                         # FastAPI application entry point and server startup
│   └── requirements.txt                                # Python pip dependencies
├── 📁 test/                                             # Comprehensive test suite for the backend
│   ├── 📁 .pytest_cache/                                # Directory
│   │   ├── 📁 v/                                        # Directory
│   │   │   └── 📁 cache/                                # Directory
│   │   │       ├── lastfailed                          # Project file
│   │   │       └── nodeids                             # Project file
│   │   ├── .gitignore                                  # Files excluded from git version control
│   │   ├── CACHEDIR.TAG                                # Project file
│   │   └── README.md                                   # Main project documentation and quick start guide
│   ├── 📁 e2e/                                          # Directory
│   │   ├── __init__.py                                 # Python source code
│   │   ├── test_admin_employee_flow.py                 # Automated test cases
│   │   ├── test_employee_leave_flow.py                 # Automated test cases
│   │   ├── test_leave_cancel_flow.py                   # Automated test cases
│   │   ├── test_leave_rejection_flow.py                # Automated test cases
│   │   └── test_notification_flow.py                   # Automated test cases
│   ├── 📁 fixtures/                                     # Directory
│   │   ├── __init__.py                                 # Python source code
│   │   ├── database.py                                 # SQLAlchemy async database engine setup
│   │   ├── leaves.py                                   # Python source code
│   │   ├── notifications.py                            # Python source code
│   │   ├── settings.py                                 # Python source code
│   │   └── users.py                                    # Python source code
│   ├── 📁 integration/                                  # Directory
│   │   ├── 📁 auth/                                     # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── test_login.py                           # Automated test cases
│   │   │   └── test_register.py                        # Automated test cases
│   │   ├── 📁 dashboard/                                # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   └── test_dashboard_s...                     # Automated test cases
│   │   ├── 📁 employees/                                # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── test_create_empl...                     # Automated test cases
│   │   │   ├── test_deactivate_...                     # Automated test cases
│   │   │   ├── test_list_employ...                     # Automated test cases
│   │   │   └── test_update_empl...                     # Automated test cases
│   │   ├── 📁 leaves/                                   # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── test_apply_leave.py                     # Automated test cases
│   │   │   ├── test_approve_leave.py                   # Automated test cases
│   │   │   ├── test_cancel_leave.py                    # Automated test cases
│   │   │   ├── test_leave_balance.py                   # Automated test cases
│   │   │   ├── test_leave_history.py                   # Automated test cases
│   │   │   ├── test_pending_reques...                  # Automated test cases
│   │   │   └── test_reject_leave.py                    # Automated test cases
│   │   ├── 📁 notifications/                            # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── test_list_no...                         # Automated test cases
│   │   │   ├── test_mark_al...                         # Automated test cases
│   │   │   └── test_mark_re...                         # Automated test cases
│   │   ├── 📁 reports/                                  # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   └── test_org_report.py                      # Automated test cases
│   │   ├── 📁 settings/                                 # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── test_get_settings.py                    # Automated test cases
│   │   │   └── test_update_setti...                    # Automated test cases
│   │   └── __init__.py                                 # Python source code
│   ├── 📁 performance/                                  # Directory
│   │   ├── __init__.py                                 # Python source code
│   │   ├── test_dashboard_load.py                      # Automated test cases
│   │   ├── test_employee_list_load.py                  # Automated test cases
│   │   ├── test_leave_apply_load.py                    # Automated test cases
│   │   └── test_login_load.py                          # Automated test cases
│   ├── 📁 unit/                                         # Directory
│   │   ├── 📁 auth/                                     # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── test_auth_service.py                    # Automated test cases
│   │   │   └── test_security.py                        # Automated test cases
│   │   ├── 📁 dashboard/                                # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   └── test_dashboard_service.py               # Automated test cases
│   │   ├── 📁 employees/                                # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── test_employee_repositor...              # Automated test cases
│   │   │   └── test_employee_service.py                # Automated test cases
│   │   ├── 📁 leaves/                                   # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   ├── test_leave_repository.py                # Automated test cases
│   │   │   ├── test_leave_service.py                   # Automated test cases
│   │   │   └── test_leave_validators.py                # Automated test cases
│   │   ├── 📁 notifications/                            # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   └── test_notification_h...                  # Automated test cases
│   │   ├── 📁 settings/                                 # Directory
│   │   │   ├── __init__.py                             # Python source code
│   │   │   └── test_settings_service.py                # Automated test cases
│   │   └── __init__.py                                 # Python source code
│   ├── conftest.py                                     # Python source code
│   └── pytest.ini                                      # Project file
├── .env.example                                        # Example environment variables template
├── .gitignore                                          # Files excluded from git version control
├── LICENSE                                             # Project file
├── README.md                                           # Main project documentation and quick start guide
├── filtered_tree.txt                                   # Project file
├── scripts                                             # Project file
└── tree_output.txt                                     # Project file
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

---

## 🏗️ Detailed File Architecture & Component Breakdown

*Note: There are **no duplicate files** in the repository. If you saw files like `account-settings...` in the directory tree above, it was just a visual truncation (the command output was cut off). The project is fully clean and organized.*

Below is a detailed breakdown of the largest and most critical files in the system, explaining exactly what each one does:

### 🖥️ Frontend (Next.js - `client/src/`)

**1. `features/dashboard/DashboardPage.js`**

- **What it does:** The main landing page after a user logs in. It calculates and displays key metrics (like pending approvals, leave balances) using dynamic charts (Recharts). It shows different data depending on whether you are an Employee, Manager, or Admin.

**2. `features/leaves/apply/ApplyLeavePage.js` (and related leave files)**

- **What it does:** Contains the logic and forms for employees to request time off. It handles date picking, validates if the user has enough balance, checks for overlapping leaves, and submits the request to the backend.

**3. `features/organizations/OrganizationDetailsPage.js` & `TenantDetailsPage.js`**

- **What it does:** Used by the Platform Owners (Super Admins) to manage different client organizations (tenants). It allows creating new companies in the system, managing their admin users, and viewing cross-organization reports.

**4. `features/employees/EmployeesPage.js`**

- **What it does:** The employee directory. Managers and Admins use this to view all staff, add new employees, assign roles (like making someone a Manager), and organize departments.

**5. `features/reports/OrganizationReportsPage.js`**

- **What it does:** Generates heavy data tables and charts for HR/Admins. It includes logic to dynamically export this data into CSV (`papaparse`) and PDF (`jsPDF`) formats without slowing down the initial page load.

**6. `services/api.js`**

- **What it does:** The central nervous system of the frontend. Every time the frontend needs to talk to the backend (to login, fetch leaves, or submit data), it uses the functions defined in this file. It automatically attaches JWT security tokens to every request.

### ⚙️ Backend (FastAPI - `server/app/`)

**1. `server/main.py`**

- **What it does:** The primary entry point for the backend server. It starts the FastAPI application, configures security middlewares (CORS, CSRF, Rate Limiting), sets up database connections, and registers all the API routes.

**2. `modules/auth/services.py` & `routes.py`**

- **What it does:** Handles everything related to security. When a user types their email and password, this file verifies the hash (Bcrypt), creates a secure JWT session token, and tracks failed login attempts to prevent brute-force attacks.

**3. `modules/leaves/services.py` & `cron.py`**

- **What it does:** The core business logic of the app. `services.py` ensures that when someone applies for leave, they aren't breaking any company policies (like going into a negative balance). `cron.py` is a background job that automatically adds new leave days to every employee's account at the end of the month.

**4. `modules/dashboard/services.py`**

- **What it does:** Runs heavy database queries to aggregate data for the frontend dashboard. It counts how many people are on leave today, how many requests are pending, and caches the results in Redis so the dashboard loads instantly.

**5. `migrations/versions/` (Alembic Files)**

- **What it does:** These are database history files. Whenever we change a database table (like adding a new column), Alembic creates a migration file here so we can safely update the production database without losing data.