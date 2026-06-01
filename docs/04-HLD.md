# High Level Design (HLD)
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  

---

## 1. System Architecture

The Leave Management System follows a **3-tier architecture** pattern:

```mermaid
graph TB
    subgraph Security["☁️ Cloudflare Edge"]
        WAF[WAF + DDoS Protection]
        SSL[SSL/TLS Termination]
    end
    
    subgraph Client["🌐 Client Tier (Browser)"]
        React[React.js SPA]
        JWT[JWT Token Storage]
    end
    
    subgraph Server["⚙️ Application Tier (Node.js)"]
        Express[Express.js Server]
        Auth[Auth Middleware]
        Routes[REST API Routes]
        BL[Business Logic]
    end
    
    subgraph Data["🗄️ Data Tier"]
        PG[PostgreSQL Database]
    end
    
    React -->|HTTPS| WAF
    WAF -->|Clean Traffic| Express
    Express --> Auth
    Auth --> Routes
    Routes --> BL
    BL --> PG
    PG -->|Data| BL
    BL -->|JSON Response| Express
    Express -->|HTTP Response| React
    JWT -.->|Authorization Header| Auth
    
    style Security fill:#F59E0B,color:#000
    style Client fill:#1e1b4b,color:#fff
    style Server fill:#0f3460,color:#fff
    style Data fill:#065f46,color:#fff
```

---

## 2. Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend** | React.js + CSS3 | React 18+, Vite 5+ | Component-based architecture, virtual DOM, fast build with Vite |
| **Backend** | Node.js + Express.js (REST API) | Node 18+, Express 4.x | Lightweight, fast I/O, huge ecosystem, easy REST APIs |
| **Database** | PostgreSQL via `pg` (node-postgres) | PG 15+, pg 8.x | ACID compliant, production-grade, robust query optimizer, advanced constraints |
| **Authentication** | JWT (`jsonwebtoken`) | 9.x | Stateless authentication, no session store needed |
| **Password Hashing** | bcryptjs | 2.x | Industry-standard password hashing |
| **Security** | Cloudflare Firewall (WAF) | — | DDoS protection, WAF rules, SSL/TLS termination, rate limiting |

---

## 3. Module Breakdown

```mermaid
graph TD
    LMS["Leave Management System"]
    
    LMS --> M1["🔐 Authentication Module"]
    LMS --> M2["📋 Leave Management Module"]
    LMS --> M3["✅ Approval Management Module"]
    LMS --> M4["📊 Dashboard Module"]
    LMS --> M5["👥 Admin Module"]
    
    M1 --> M1A[Login / Logout]
    M1 --> M1B[JWT Token Management]
    M1 --> M1C[Role-Based Access Control]
    
    M2 --> M2A[Apply Leave]
    M2 --> M2B[View Leave History]
    M2 --> M2C[Cancel Leave]
    M2 --> M2D[Leave Balance Tracking]
    
    M3 --> M3A[View Pending Requests]
    M3 --> M3B[Approve Request]
    M3 --> M3C[Reject Request]
    M3 --> M3D[Approval History]
    
    M4 --> M4A[Leave Statistics]
    M4 --> M4B[Department Analysis]
    M4 --> M4C[Monthly Trends]
    
    M5 --> M5A[Employee CRUD]
    M5 --> M5B[Role Management]
    M5 --> M5C[Balance Management]
    
    style LMS fill:#4F46E5,color:#fff
    style M1 fill:#7C3AED,color:#fff
    style M2 fill:#2563EB,color:#fff
    style M3 fill:#059669,color:#fff
    style M4 fill:#D97706,color:#fff
    style M5 fill:#DC2626,color:#fff
```

---

## 4. Module Descriptions

### 4.1 🔐 Authentication Module
**Responsibility:** Manage user identity and access control.

| Component | Description |
|-----------|------------|
| Login | Validates credentials, issues JWT token |
| Logout | Clears client-side token |
| Auth Middleware | Validates JWT on every API request, extracts user info |
| RBAC | Restricts API endpoints based on user role |

### 4.2 📋 Leave Management Module
**Responsibility:** Handle the entire leave lifecycle from application to tracking.

| Component | Description |
|-----------|------------|
| Apply Leave | Validates dates, checks balance, creates leave request |
| Leave History | Returns all leaves for current user with filters |
| Cancel Leave | Cancels pending leave, restores balance |
| Balance Tracker | Maintains per-type leave balance per employee per year |

### 4.3 ✅ Approval Management Module
**Responsibility:** Enable managers to act on leave requests.

| Component | Description |
|-----------|------------|
| Pending Queue | Fetches pending leaves from direct reports |
| Approve | Updates status, records approval with comments |
| Reject | Updates status, records rejection with reason, restores balance |

### 4.4 📊 Dashboard Module
**Responsibility:** Aggregate and present leave analytics.

| Component | Description |
|-----------|------------|
| Personal Stats | Leave balance, recent requests for employees |
| Team Stats | Team availability, pending count for managers |
| System Stats | Organization-wide trends, department breakdowns for admin |

### 4.5 👥 Admin Module
**Responsibility:** User and system management.

| Component | Description |
|-----------|------------|
| Employee CRUD | Add, edit, deactivate employees |
| Role Management | Assign/change employee roles and managers |
| Balance Reset | Reset leave balances for new year |

---

## 5. API Architecture

```mermaid
graph LR
    subgraph Public["Public Endpoints"]
        L[POST /api/auth/login]
    end
    
    subgraph Authenticated["🔐 Authenticated Endpoints"]
        subgraph Employee["👤 Employee"]
            E1[POST /api/leaves]
            E2[GET /api/leaves]
            E3[PUT /api/leaves/:id/cancel]
            E4[GET /api/leaves/balance]
        end
        
        subgraph ManagerOnly["👔 Manager"]
            M1[GET /api/leaves/pending]
            M2[PUT /api/leaves/:id/approve]
            M3[PUT /api/leaves/:id/reject]
        end
        
        subgraph AdminOnly["🛡️ Admin"]
            A1[GET /api/employees]
            A2[POST /api/employees]
            A3[PUT /api/employees/:id]
            A4[DELETE /api/employees/:id]
        end
        
        D1[GET /api/dashboard/stats]
    end
    
    style Public fill:#4F46E5,color:#fff
    style Employee fill:#10B981,color:#fff
    style ManagerOnly fill:#F59E0B,color:#000
    style AdminOnly fill:#F43F5E,color:#fff
```

---

## 6. Deployment Architecture

```mermaid
graph TD
    Browser[🌐 Browser] -->|HTTPS| CF[☁️ Cloudflare Edge]
    CF -->|WAF + DDoS Filter| Server[⚙️ Node.js Server :3000]
    Server -->|Serves| React[⚛️ React Build - Static Files]
    Server -->|Queries| DB[(🗄️ PostgreSQL :5432)]
    
    style Browser fill:#1e1b4b,color:#fff
    style CF fill:#F59E0B,color:#000
    style Server fill:#0f3460,color:#fff
    style React fill:#1a1a2e,color:#fff
    style DB fill:#065f46,color:#fff
```

**Deployment Steps:**
1. Install Node.js (v18+) and PostgreSQL (v15+)
2. Create the database: `createdb leave_management`
3. Configure `.env` with database credentials
4. Run `npm install` in both `client/` and `server/`
5. Build React app: `cd client && npm run build`
6. Run `npm start` in `server/` → serves API + React build on port 3000
7. Point Cloudflare DNS to server IP with proxy enabled (orange cloud)

---

## 7. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| **DDoS Protection** | Cloudflare Firewall — automatic DDoS mitigation at edge |
| **WAF (Web Application Firewall)** | Cloudflare managed rulesets — blocks SQLi, XSS, RCE |
| **SSL/TLS** | Cloudflare Full (Strict) mode — end-to-end encryption |
| **Rate Limiting** | Cloudflare rate rules — 100 req/min on login endpoint |
| **Password Storage** | bcrypt hashing with salt rounds |
| **Authentication** | JWT tokens with 24h expiration |
| **Authorization** | Role-based middleware on every endpoint |
| **SQL Injection** | Parameterized queries (pg prepared statements) |
| **XSS** | React auto-escapes output, Content-Security-Policy headers |
| **CORS** | Configured for React dev server origin, same-origin in production |

> 📄 See full technology details: [Technology Requirements Document (TRD)](09-TRD.md)
