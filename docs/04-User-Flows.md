# User Flows
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  

---

## 1. Employee — Login Flow

```mermaid
flowchart TD
    A[🌐 Open Application] --> B[📄 Login Page]
    B --> C[✍️ Enter Email & Password]
    C --> D{Valid Credentials?}
    D -->|Yes| E{Check User Role}
    D -->|No| F[❌ Show Error Message]
    F --> C
    E -->|Employee| G[📊 Employee Dashboard]
    E -->|Manager| H[📊 Manager Dashboard]
    E -->|Admin| I[📊 Admin Dashboard]
    
    style A fill:#1e1b4b,color:#fff
    style G fill:#065f46,color:#fff
    style H fill:#065f46,color:#fff
    style I fill:#065f46,color:#fff
    style F fill:#7f1d1d,color:#fff
```

---

## 2. Employee — Apply Leave Flow

```mermaid
flowchart TD
    A[📊 Employee Dashboard] --> B[🖱️ Click 'Apply Leave']
    B --> C[📋 Leave Application Form]
    C --> D[Select Leave Type]
    D --> E[Select Start & End Date]
    E --> F[Enter Reason]
    F --> G{Validate Input}
    G -->|End < Start| H[❌ Invalid Date Range]
    G -->|Start < Today| I[❌ Cannot Apply Past Date]
    G -->|Overlapping Leave| J[❌ Overlapping Leave Exists]
    G -->|Insufficient Balance| K[❌ Insufficient Leave Balance]
    G -->|Valid| L[✅ Submit Leave Request]
    H --> E
    I --> E
    J --> E
    K --> D
    L --> M[📝 Leave Created - Status: PENDING]
    M --> N[📊 Redirect to Leave History]
    N --> O[👔 Manager Receives Notification]
    
    style A fill:#1e1b4b,color:#fff
    style L fill:#065f46,color:#fff
    style M fill:#065f46,color:#fff
    style H fill:#7f1d1d,color:#fff
    style I fill:#7f1d1d,color:#fff
    style J fill:#7f1d1d,color:#fff
    style K fill:#7f1d1d,color:#fff
```

---

## 3. Manager — Approval Flow

```mermaid
flowchart TD
    A[📊 Manager Dashboard] --> B[📋 View Pending Requests]
    B --> C{Any Pending Requests?}
    C -->|No| D[ℹ️ No Pending Requests]
    C -->|Yes| E[📄 Review Request Details]
    E --> F{Decision}
    F -->|Approve| G[💬 Add Optional Comments]
    F -->|Reject| H[💬 Add Mandatory Reason]
    G --> I[✅ Status → APPROVED]
    H --> J[❌ Status → REJECTED]
    J --> K[🔄 Leave Balance Restored]
    I --> L[👤 Employee Sees Updated Status]
    K --> L
    
    style A fill:#1e1b4b,color:#fff
    style I fill:#065f46,color:#fff
    style J fill:#7f1d1d,color:#fff
    style L fill:#1e3a5f,color:#fff
```

---

## 4. Admin — Employee Management Flow

```mermaid
flowchart TD
    A[📊 Admin Dashboard] --> B[👥 Employee Management]
    B --> C{Action?}
    C -->|Add| D[📋 Add Employee Form]
    C -->|Edit| E[📋 Edit Employee Form]
    C -->|Remove| F[⚠️ Confirmation Dialog]
    D --> G[Enter Name, Email, Password, Role, Dept, Manager]
    G --> H{Valid Input?}
    H -->|Email Exists| I[❌ Duplicate Email Error]
    H -->|Valid| J[✅ Employee Created]
    J --> K[📝 Default Leave Balances Set]
    E --> L[Update Role / Dept / Manager]
    L --> M[✅ Employee Updated]
    F --> N{Confirm?}
    N -->|Yes| O[✅ Employee Deactivated]
    N -->|No| B
    
    style A fill:#1e1b4b,color:#fff
    style J fill:#065f46,color:#fff
    style M fill:#065f46,color:#fff
    style O fill:#065f46,color:#fff
    style I fill:#7f1d1d,color:#fff
```

---

## 5. Complete System — Sequence Diagram

```mermaid
sequenceDiagram
    participant E as 👤 Employee
    participant FE as 🌐 Frontend
    participant API as ⚙️ Backend API
    participant DB as 🗄️ Database
    participant M as 👔 Manager

    Note over E,M: Authentication Flow
    E->>FE: Enter credentials
    FE->>API: POST /api/auth/login
    API->>DB: Verify credentials
    DB-->>API: User data
    API-->>FE: JWT Token + Role
    FE-->>E: Redirect to Dashboard

    Note over E,M: Leave Application Flow
    E->>FE: Fill leave form
    FE->>API: POST /api/leaves
    API->>DB: Validate & Create leave
    DB-->>API: Leave created
    API-->>FE: Success response
    FE-->>E: Show confirmation

    Note over E,M: Manager Approval Flow
    M->>FE: Open pending requests
    FE->>API: GET /api/leaves/pending
    API->>DB: Fetch pending leaves
    DB-->>API: Leave requests
    API-->>FE: Pending list
    FE-->>M: Display requests
    M->>FE: Click Approve/Reject
    FE->>API: PUT /api/leaves/:id/approve
    API->>DB: Update status
    DB-->>API: Updated
    API-->>FE: Success
    FE-->>M: Status updated

    Note over E,M: Status Check
    E->>FE: View leave history
    FE->>API: GET /api/leaves
    API->>DB: Fetch user leaves
    DB-->>API: Leave list
    API-->>FE: Leave data
    FE-->>E: Show updated status
```

---

## 6. Navigation Map

```mermaid
flowchart LR
    Login[🔐 Login Page]
    
    subgraph Employee["👤 Employee Views"]
        ED[Dashboard]
        AL[Apply Leave]
        LH[Leave History]
    end
    
    subgraph Manager["👔 Manager Views"]
        MD[Dashboard]
        PR[Pending Requests]
        TO[Team Overview]
    end
    
    subgraph Admin["🛡️ Admin Views"]
        AD[Dashboard]
        EM[Employee Management]
        SS[System Stats]
    end
    
    Login -->|Employee| ED
    Login -->|Manager| MD
    Login -->|Admin| AD
    
    ED --> AL
    ED --> LH
    
    MD --> PR
    MD --> TO
    MD --> AL
    MD --> LH
    
    AD --> EM
    AD --> SS
    AD --> PR
    AD --> AL
    
    style Login fill:#4F46E5,color:#fff
    style ED fill:#10B981,color:#fff
    style AL fill:#10B981,color:#fff
    style LH fill:#10B981,color:#fff
    style MD fill:#F59E0B,color:#000
    style PR fill:#F59E0B,color:#000
    style TO fill:#F59E0B,color:#000
    style AD fill:#F43F5E,color:#fff
    style EM fill:#F43F5E,color:#fff
    style SS fill:#F43F5E,color:#fff
```
