# Technology Requirements Document (TRD)
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  

---

## 1. Technology Stack Overview

The Leave Management System utilizes a modern, highly performant, and secure stack featuring a **Next.js App Router** frontend, a **FastAPI (Python)** REST API backend, and a robust **PostgreSQL** database, configured for clean host-level execution and security.

```mermaid
graph TB
    subgraph Frontend["🌐 Frontend (Next.js)"]
        Next["Next.js (v14/15+)"]
        AppRouter["App Router (Hybrid Pages)"]
        CSS["CSS3 (Vanilla Modern CSS)"]
        Fetch["Fetch API (Native HTTP)"]
        Context["React Context API (Auth State)"]
    end
    
    subgraph Backend["⚙️ Backend (Python REST API)"]
        FastAPI["FastAPI (v0.110+)"]
        Pydantic["Pydantic v2 (Validation)"]
        PyJWT["PyJWT (Token Authentication)"]
        Passlib["passlib[bcrypt] (Password Hashing)"]
    end
    
    subgraph Database["🗄️ Database"]
        PG["PostgreSQL (v15+)"]
        AsyncPG["asyncpg / psycopg3"]
    end
    
    subgraph Security["🔒 Host Security & Gateway"]
        Nginx["Nginx Reverse Proxy"]
        UFW["OS Firewall (UFW)"]
        SSL["SSL/TLS (Let's Encrypt)"]
        Limiter["FastAPI Rate Limiting"]
    end
    
    Next -->|HTTPS / JSON API| Nginx
    Nginx -->|Clean Traffic| FastAPI
    FastAPI -->|Token Auth / JWT Validation| PyJWT
    FastAPI -->|Async Queries| PG
    
    style Frontend fill:#1e1b4b,color:#fff
    style Backend fill:#0f3460,color:#fff
    style Database fill:#065f46,color:#fff
    style Security fill:#7f1d1d,color:#fff
```

---

## 2. Detailed Technology Breakdown

### 2.1 Frontend Technologies

| Technology | Version | Purpose | Why Chosen |
|-----------|:-------:|---------|------------|
| **Next.js** | 14/15+ | React Framework | Modern React standard, hybrid Server/Client rendering, native routing, optimized builds, out-of-the-box SEO |
| **App Router** | — | Routing & Layouts | Declarative folder-based routing, server components for static pages, layout inheritance |
| **Fetch API** | Native | HTTP Client | Native browser support, robust caching, no extra dependencies, seamless integration with Next.js caching |
| **CSS3 (Vanilla)** | — | UI Styling | Premium aesthetics (dark mode, glassmorphism), no CSS framework overhead, absolute styling control |
| **React Context** | — | State Management | Lightweight, built-in, perfect for global session (JWT) storage and current user context |

### 2.2 Backend Technologies

| Technology | Version | Purpose | Why Chosen |
|-----------|:-------:|---------|------------|
| **FastAPI** | 0.110+ | REST API Framework | Outstanding performance (on par with Node/Express & Go), automated Swagger UI generation, native async/await |
| **Python** | 3.10+ | Runtime Environment | High readability, mature ecosystem, powerful data manipulation, excellent for building scalable services |
| **Pydantic v2** | 2.x | Data Validation | Strongly-typed request/response validation, automatic error message parsing, fast performance |
| **PyJWT** | 2.x | Token Management | Lightweight, secure implementation of JSON Web Tokens for stateless authentication |
| **passlib[bcrypt]**| 1.7+ | Password Hashing | Secure one-way hashing with salt parameters, industry standard |
| **asyncpg / psycopg3** | — | PostgreSQL Driver | High-speed asynchronous client driver for database connection and query execution |
| **Uvicorn** | 0.28+ | ASGI Web Server | Lightning-fast ASGI server for running FastAPI applications in production |

### 2.3 Database

| Technology | Version | Purpose | Why Chosen |
|-----------|:-------:|---------|------------|
| **PostgreSQL** | 15+ | Relational Database | ACID compliance, production-grade reliability, foreign keys, constraints validation, transaction support |

**PostgreSQL Advantages for this project:**
- ✅ **ACID Transactions** — Crucial to ensure that leave balance updates are atomic (e.g., deducting a balance must succeed if and only if the leave request is approved successfully).
- ✅ **Referential Integrity** — Foreign keys guarantee consistent data associations between `employees`, `leave_requests`, `leave_balances`, and `leave_approvals`.
- ✅ **Check Constraints** — Multi-layered data protection enforcing allowed database values (e.g., `role` in ('employee', 'manager', 'admin'), `status` in ('pending', 'approved', 'rejected', 'cancelled')) at the SQL schema level.
- ✅ **Connection Pooling** — Asynchronous pool utilization to handle simultaneous application requests with minimal overhead.

### 2.4 Authentication & Security

| Technology | Version | Purpose | Why Chosen |
|-----------|:-------:|---------|------------|
| **JWT (JSON Web Tokens)** | — | Authentication | Stateless authentication. The client stores the token in memory or secure HTTPOnly cookies and includes it in the `Authorization: Bearer <token>` header, reducing database lookups for session validation. |
| **bcrypt** | — | Cryptographic Hashing | Dynamic salting makes pre-computed dictionary and rainbow table attacks computationally unfeasible. |
| **Nginx Reverse Proxy** | — | Gateway Shielding | Acts as a gateway proxy, hiding the backend application ports, managing secure SSL termination, and handling large volumetric connections. |

---

## 3. Host-Level Security & Gateway Configuration

### 3.1 Reverse Proxy Pipeline

Nginx acts as a **reverse proxy** and API gateway in front of our FastAPI application, shielding the Python web server ports, handling SSL termination, and enforcing basic rate limits.

```mermaid
graph LR
    User["👤 Client (Next.js App)"] -->|HTTPS / Port 443| Nginx["🛡️ Nginx Proxy Gateway"]
    Nginx -->|Rate Limiter & SSL check| Filter["⚙️ Gateway Filters"]
    Filter -->|Pass Clean Traffic| FastAPI["⚙️ FastAPI Backend (Port 8000)"]
    Filter -.->|Block Overflows| Drop["🚫 429 Rate Limited"]
    
    style User fill:#4F46E5,color:#fff
    style Nginx fill:#10B981,color:#fff
    style Filter fill:#F43F5E,color:#fff
    style FastAPI fill:#0f3460,color:#fff
    style Drop fill:#7f1d1d,color:#fff
```

### 3.2 Gateway Security Configurations

| Mechanism | Configuration Location | Action / Rule | Rationale |
|-----------|------------------------|---------------|-----------|
| **Rate Limiting** | Nginx `nginx.conf` | `limit_req_zone` limit of 30 req/m on `/api/auth/login` | Prevents credential brute-forcing at the gateway layer. |
| **SSL/TLS Termination**| Nginx Site Configuration | TLS v1.2 & TLS v1.3 with Let's Encrypt | Enforces modern cryptographic cipher suites and secure connections. |
| **OS Firewall** | Host OS (UFW) | Allow only port 80/443, block direct port 8000/5432 | Shields internal backend services from direct public access. |
| **CORS Guard** | FastAPI `CORSMiddleware` | Allowed origins configured to verified app domains | Restricts cross-origin requests at the runtime layer. |
| **Request Size Limits**| Nginx `client_max_body_size` | Restrict payloads to 2MB | Blocks denial-of-service attempts exploiting large request bodies. |

---

## 4. Architecture Layers & Data Flow

### 4.1 End-to-End Request Lifecycle

```mermaid
sequenceDiagram
    participant U as 👤 User Client
    participant FE as 🌐 Next.js App
    participant GW as 🛡️ Nginx Gateway
    participant BE as ⚙️ FastAPI Backend
    participant JWT as 🔐 Auth Dep (PyJWT)
    participant DB as 🗄️ PostgreSQL
    
    U->>FE: Access Login Page
    FE-->>U: Return SSR/Static Login UI
    U->>FE: Enter Credentials
    FE->>GW: POST /api/auth/login
    GW->>GW: Evaluate connection rate limits
    GW->>BE: Forward Safe Proxy Payload (Port 8000)
    BE->>DB: Fetch user by email
    DB-->>BE: User Record & Password Hash
    BE->>BE: Verify hashed password
    BE->>JWT: Generate JWT Token (payload: user_id, email, role)
    BE-->>GW: Response (200 OK + JWT Token in JSON)
    GW-->>FE: JWT Token + User Metadata
    FE-->>U: Transition state to Dashboard, store JWT in AuthContext
    
    U->>FE: Click "Apply Leave" (Casual)
    FE->>GW: POST /api/leaves (Headers: Auth Bearer JWT)
    GW->>BE: Forward Request
    BE->>JWT: Extract & Validate JWT
    JWT-->>BE: Decoded Payload (id: 1, role: employee)
    BE->>DB: Check Leave Balance & Validate overlaps
    DB-->>BE: Balance status (Available: 10 days)
    BE->>DB: INSERT INTO leave_requests (Pending)
    DB-->>BE: Inserted leave details
    BE-->>GW: JSON Success Response (201 Created)
    GW-->>FE: Render Success Message
    FE-->>U: Update Dashboard Stats & Leave Table
```

### 4.2 Application Directory Structure

To fulfill this modular architecture, the repository is organized into distinct, clean directories:

```
Bookflow-management/
│
├── 📁 docs/                         # Technology-agnostic & architecture documents
│   ├── 01-PRD.md
│   ├── 02-TRD.md                    # Technology Requirements (This File)
│   ├── 03-User-Stories.md
│   ├── 04-User-Flows.md
│   ├── 05-HLD.md
│   ├── 06-LLD.md
│   ├── 07-API-Documentation.md
│   ├── 08-Wireframes.md
│   └── 09-Test-Plan.md
│
├── 📁 server/                       # 🐍 Python REST API (FastAPI Backend)
│   ├── main.py                      #    FastAPI application entrypoint
│   ├── requirements.txt             #    Python dependencies
│   ├── .env                         #    Backend secret variables
│   ├── 📁 app/
│   │   ├── __init__.py
│   │   ├── config.py                #    Environment configuration
│   │   ├── database.py              #    SQLAlchemy/Database connection setup
│   │   ├── models.py                #    SQLAlchemy DB Models
│   │   ├── schemas.py               #    Pydantic Request/Response validation schemas
│   │   ├── 📁 middleware/
│   │   │   └── security.py          #    CORS setup and secure headers
│   │   └── 📁 routes/
│   │       ├── auth.py              #    Login, password utility, token generator
│   │       ├── leaves.py            #    Apply, view, cancel, approve, reject leaves
│   │       ├── dashboard.py         #    Role-based statistics query routers
│   │       └── employees.py         #    Admin employee CRUD router
│   └── 📁 db/
│       ├── schema.sql               #    Raw DDL definitions for PostgreSQL
│       └── seed.py                  #    Asynchronous demo database seeder
│
└── 📁 client/                       # 🌐 Next.js Frontend (React SPA)
    ├── package.json                 #    Node dependencies
    ├── next.config.js               #    Next.js configuration
    ├── 📁 public/                   #    Static assets (logos, images)
    └── 📁 src/
        ├── 📁 app/                  #    App Router folders (Pages & Layouts)
        │   ├── layout.js            #    Global HTML Layout (Fonts, Head, Viewports)
        │   ├── page.js              #    Landing / Routing router
        │   ├── login/
        │   │   └── page.js          #    Login Component
        │   ├── dashboard/
        │   │   └── page.js          #    Role-based statistics dashboard page
        │   ├── apply-leave/
        │   │   └── page.js          #    Leave submission form
        │   ├── leave-history/
        │   │   └── page.js          #    Leaves summary table
        │   ├── pending-requests/
        │   │   └── page.js          #    Manager approval view
        │   └── employees/
        │       └── page.js          #    Admin employee management
        ├── 📁 context/
        │   └── AuthContext.js       #    Authentication React Provider
        ├── 📁 components/           #    Reusable visual widgets
        │   ├── Layout/
        │   │   ├── Sidebar.js       #    Navigation Sidebar widget
        │   │   └── Header.js        #    Header with user info
        │   └── UI/
        │       ├── Card.js          #    Glassmorphic container
        │       ├── Button.js        #    Stylized interactable buttons
        │       ├── Badge.js         #    Colored status indicator badges
        │       ├── Modal.js         #    Interactive popup form modal
        │       └── StatCard.js      #    Visual progress / stat indicator
        ├── 📁 services/
        │   └── api.js               #    Core fetch wrapper with bearer JWT handler
        └── app.css                  #    Global design token styling sheet
```

---

## 5. Development & Production Environment Variables

### 5.1 Backend Environment Configuration (`server/.env`)

```env
# Server Deployment Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# PostgreSQL Database Connection
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leave_management

# Asynchronous Database URL
DATABASE_URL=postgresql+asyncpg://postgres:your_secure_password@localhost:5432/leave_management

# Authentication (JWT)
JWT_SECRET=your-super-cryptographically-secure-key-phrase
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 5.2 Frontend Environment Configuration (`client/.env.local`)

```env
# Target Backend Endpoint Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 6. System Requirements

### 6.1 Developer Workstation Requirements

| Parameter | Minimum | Recommended |
|-----------|---------|-------------|
| **Python** | v3.10.x | v3.11.x |
| **Node.js**| v18.0.0 | v20.x.x |
| **Database**| PostgreSQL v15 | PostgreSQL v16 |
| **Memory (RAM)**| 8 GB | 16 GB |
| **Available Disk**| 1 GB | 5 GB |
| **Tools** | VS Code, git, pgAdmin / DBeaver, Postman | VS Code, git, Docker (optional for PG) |

### 6.2 Production Server Requirements (Target)

| Service | Architecture | Scale (Standard) |
|---------|--------------|-------------------|
| **Frontend Web App** | Next.js Server / Serverless Host Node | 1 vCPU, 1GB RAM (Dynamic Node instance) or Serverless Edge |
| **REST API Server** | FastAPI Backend on Uvicorn | 2 vCPU, 2GB RAM (Scalable Linux VPS / Gunicorn worker instances) |
| **Database Instance** | Dedicated Managed PostgreSQL | vCPU, 2GB RAM, SSD-backed storage with Connection Pooling enabled |
| **Security Gateway** | Gateway Host with Nginx | 1 vCPU, 1GB RAM (Gateway with rate limits and SSL termination) |
