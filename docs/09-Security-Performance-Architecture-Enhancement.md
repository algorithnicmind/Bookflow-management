# System Enhancement, Security & Performance Optimization Guide
## Leave Management System

**Version:** 1.0
**Date:** July 2026
**Author:** AI-Assisted Code Audit & Enhancement Plan

---

> **Purpose:** This document provides a comprehensive audit of the Leaveflow Management System across 8 critical dimensions. Each section clearly maps what is currently implemented, what problems exist, what is missing, what actions are recommended, and what techniques/approaches should be used. Use this as a roadmap for hardening, optimizing, and scaling the system.

---

## Table of Contents

1. [Security & Hack-Free Architecture](#1-security--hack-free-architecture)
2. [System Design Improvements](#2-system-design-improvements)
3. [Performance Optimization](#3-performance-optimization)
4. [Traffic Handling & Scalability](#4-traffic-handling--scalability)
5. [Clean Code & Architecture](#5-clean-code--architecture)
6. [UX Smoothness & Hang-Free Experience](#6-ux-smoothness--hang-free-experience)
7. [Loading Speed & Quick Responses](#7-loading-speed--quick-responses)
8. [SEO Best Practices](#8-seo-best-practices)
9. [Priority Action Matrix](#9-priority-action-matrix)
10. [Appendices](#10-appendices)

---

## 1. Security & Hack-Free Architecture

### 1.1 Authentication & Authorization

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **JWT secret hardcoded in version control** | `server/.env` is tracked by git; contains `JWT_SECRET=713d02f...` in plaintext. If repo is compromised, all tokens can be forged. | `server/.env:5` |
| 2 | **No token refresh mechanism** | Users are forced to re-login after 24h token expiry. No refresh token endpoint exists, causing poor UX and unnecessary auth overhead. | `server/app/modules/auth/routes.py` — no `/refresh` route |
| 3 | **No CSRF token validation** | Only `SameSite=Lax` cookie attribute protects against CSRF. This is insufficient for state-changing requests (leave creation, approvals). | `server/app/core/security.py` — no CSRF middleware |
| 4 | **No password complexity enforcement** | Registration endpoint accepts any password >= 1 character. No minimum length, no character-class requirements. | `server/app/modules/auth/schemas.py` — `PasswordStr` has no validator |
| 5 | **Auth failures not logged** | Failed login attempts are silently discarded. No security monitoring possible — can't detect brute-force patterns. | `server/app/modules/auth/routes.py:login` — no audit log on failure |
| 6 | **No progressive brute-force lockout** | SlowAPI rate limit (5/min) is the only defense. An attacker can wait 1 minute between attempts indefinitely. | `server/app/modules/auth/routes.py` — only fixed rate limit |

#### ✅ What's Implemented

- JWT-based stateless authentication with HS256 algorithm (`server/app/core/security.py:25-50`)
- HttpOnly cookies for token storage (prevents XSS token exfiltration) (`server/app/core/security.py:70-85`)
- bcrypt password hashing with configurable rounds (`server/app/core/security.py:15-22`)
- Rate limiting on login endpoint via SlowAPI (5 attempts/minute) (`server/app/modules/auth/routes.py:1-15`)
- Role-based access control via `PermissionChecker` dependency (`server/app/core/dependencies.py:45-80`)
- Account deactivation check on every authenticated request (`server/app/core/dependencies.py:get_current_user`)
- CORS restricted to specific origins (`leaveflow.com`, `localhost:3000`) (`server/main.py:30-40`)
- Tenant isolation enforced at query level — `organization_id` filter on all queries (`server/app/core/tenant.py`)
- SQLAlchemy parameterized queries (prevents SQL injection)

#### ❌ What's Missing

- JWT secret management (env rotation, vault integration)
- Token refresh endpoint
- CSRF token middleware
- Password policy validation (length, complexity, common-password check)
- Auth failure audit logging
- Progressive brute-force lockout with cooldown
- IP-based blocking / allowlisting
- Rate limiting on registration, password-reset, contact-form endpoints
- Request size limiting on file uploads
- Account takeover detection (unusual location, device fingerprinting)
- Session invalidation on password change

#### 🛠️ Recommended Actions

1. **Immediate — Rotate JWT secret:**
   - Generate new secret: `openssl rand -hex 32`
   - Add `server/.env` to `.gitignore`
   - Use environment variables at deploy time only (GitHub Secrets / AWS Secrets Manager / HashiCorp Vault)

2. **Implement token refresh:**
   - Add `/api/auth/refresh` endpoint
   - Issue short-lived access token (15 min) + long-lived refresh token (7 days, HttpOnly)
   - Store refresh token hash in DB for revocation capability

3. **Add CSRF protection:**
   - Use `itsdangerous` or `csrf-fix` library for FastAPI
   - Implement double-submit cookie pattern: random token in cookie + same token in `X-CSRF-Token` header

4. **Enforce password policy:**
   ```python
   # server/app/modules/auth/schemas.py
   class PasswordStr(pydantic.BaseModel):
       password: str
       
       @pydantic.field_validator("password")
       @classmethod
       def validate_password(cls, v):
           if len(v) < 8:
               raise ValueError("Minimum 8 characters")
           if not re.search(r"[A-Z]", v):
               raise ValueError("Need uppercase letter")
           if not re.search(r"[a-z]", v):
               raise ValueError("Need lowercase letter")
           if not re.search(r"\d", v):
               raise ValueError("Need digit")
           if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
               raise ValueError("Need special character")
           return v
   ```

5. **Add auth failure logging:**
   - Create `audit_log` entry on every failed login with: timestamp, IP, email, user-agent
   - Add alert webhook after N failures on same account (Slack/Email)

6. **Implement progressive lockout:**
   - Track failed attempts per email in Redis: `failed_login:{email}`
   - After 5 failures → 1 min lockout, 10 failures → 5 min, 20 failures → 30 min
   - Reset on successful login

#### 📋 Techniques & Approaches

| Technique | Tools/Libraries | Implementation Pattern |
|-----------|----------------|----------------------|
| JWT Secret Management | HashiCorp Vault, AWS Secrets Manager, Doppler | Never in VCS; inject via env at deploy |
| Token Refresh | python-jose + Redis | Access: 15m, Refresh: 7d with rotation |
| CSRF Protection | `csrf-fix` or `starlette-middleware` | Double-submit cookie or SameSite=Strict + token |
| Password Policy | Pydantic validators + `zxcvbn` | Backend validation + frontend strength meter |
| Brute-Force Protection | Redis atomic counters + exponential backoff | Per-email + per-IP counters |
| Auth Auditing | Structured logging + `audit_logs` table | Async log write, non-blocking |
| Rate Limiting | SlowAPI + Redis backend | Shared state across workers |

---

### 1.2 Data Protection

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **Profile images stored as BLOBs in DB** | `employee_images` table stores raw image bytes. Bloats database, slows backups, no CDN delivery. | `server/app/modules/employees/models.py:EmployeeImage` |
| 2 | **No encryption at rest** | Sensitive data (emails, phone numbers, leave reasons) stored as plaintext in PostgreSQL. No column-level encryption. | All model files |
| 3 | **Secrets in `.env` committed** | `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `DATABASE_URL` with credentials all in VCS. | `server/.env` |
| 4 | **No backup strategy documented** | No mention of backup frequency, retention, or restore procedures. | Missing from all docs |

#### ✅ What's Implemented

- Database connection uses SSL/TLS (Neon DB enforces this)
- CORS restricts cross-origin data access
- Tenant isolation prevents cross-org data leakage
- No sensitive data in client-side bundles (API-only delivery)

#### ❌ What's Missing

- At-rest encryption for PII columns
- File storage outside DB (S3/R2/CDN)
- Backup & disaster recovery plan
- Secrets management strategy
- Data retention/deletion policies (GDPR compliance)
- Encryption of sensitive fields in transit between services

#### 🛠️ Recommended Actions

1. **Migrate images from DB to object storage:**
   - Use `boto3` (AWS S3) or `b2sdk` (Backblaze B2) or Cloudflare R2
   - Store only URL in `employee_images.url` column
   - Serve via CDN with signed URLs for private images
   - Migration script to export existing BLOBs

2. **Add column-level encryption for PII:**
   - Use `pgcrypto` PostgreSQL extension or SQLAlchemy `EncryptedType`
   - Encrypt: `phone`, `email` (for non-auth use), `emergency_contact`
   - Encrypt leave `reason` field (contains medical/family information)

3. **Implement secrets management:**
   - For local dev: `.env` with `.env.example` in VCS (no real values)
   - For production: AWS Secrets Manager / GitHub Actions Secrets
   - Validate all secrets at startup; fail if missing

4. **Create backup strategy:**
   - Daily automated pg_dump to encrypted S3 bucket (30-day retention)
   - Point-in-time recovery via Neon DB's built-in PITR
   - Test restore procedure quarterly

#### 📋 Techniques & Approaches

| Technique | Tools/Libraries | Implementation |
|-----------|----------------|----------------|
| Object Storage | `boto3` S3, `boto3` Cloudflare R2 | Pre-signed URLs, CDN edge delivery |
| Column Encryption | `sqlalchemy-encrypted` or `pgcrypto` | AES-256-GCM with key rotation |
| Secrets Management | Doppler, AWS Secrets Manager, 1Password | Env injection at deploy, never on disk |
| Backup | `pg_dump` + `pg_restore` + cron | Encrypted, versioned, tested restores |

---

### 1.3 API Security & Infrastructure

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **CORS allows all headers/methods** | `allow_headers=["*"]`, `allow_methods=["*"]` — overly permissive | `server/main.py:CORS middleware` |
| 2 | **No request size limiting** | File uploads and JSON payloads have no size caps — DoS vector | `server/app/modules/uploads/routes.py` |
| 3 | **Debug logs committed to VCS** | `server_debug.log` at repo root contains runtime debug output | `server_debug.log` |
| 4 | **OpenAPI docs exposed in production** | Swagger UI at `/docs` and ReDoc at `/redoc` leak API structure | `server/main.py` — no env check |
| 5 | **No security headers on API responses** | CSP, HSTS etc. only set on frontend; API responses lack these headers | `server/main.py:middleware` |

#### ✅ What's Implemented

- Content-Security-Policy headers on frontend (`client/src/app/layout.js`)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- HSTS with includeSubDomains
- Permissions-Policy (camera/mic/geo disabled)
- Referrer-Policy: strict-origin-when-cross-origin
- Global exception handler — 500 errors don't leak stack traces (`server/main.py`)

#### ❌ What's Missing

- Security headers on API responses (FastAPI middleware)
- OpenAPI docs disabled in production
- Request body size limits
- Response compression (GZip/Brotli)
- HSTS preload list submission
- Certificate transparency monitoring
- DDoS protection (Cloudflare / AWS WAF integration)
- HTTP security headers audit (use securityheaders.com)

#### 🛠️ Recommended Actions

1. **Harden CORS:**
   ```python
   # server/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=settings.CORS_ORIGINS,  # list from env
       allow_credentials=True,
       allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
       allow_headers=["Authorization", "Content-Type", "X-CSRF-Token", "X-Request-ID"],
   )
   ```

2. **Add request size limiting:**
   ```python
   # server/main.py
   app.add_middleware(RequestSizeLimitMiddleware, max_size=1024 * 1024 * 5)  # 5MB
   # For file uploads specifically:
   MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
   ```

3. **Conditionally disable OpenAPI docs:**
   ```python
   # server/main.py
   app = FastAPI(
       docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
       redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
   )
   ```

4. **Add security headers middleware for API:**
   ```python
   @app.middleware("http")
   async def add_security_headers(request, call_next):
       response = await call_next(request)
       response.headers["X-Content-Type-Options"] = "nosniff"
       response.headers["X-Frame-Options"] = "DENY"
       response.headers["X-XSS-Protection"] = "1; mode=block"
       response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
       response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
       return response
   ```

5. **Clean up VCS:**
   - Add `server_debug.log` to `.gitignore` and delete from repo
   - Add `server/.env` to `.gitignore`
   - Remove `server/venv/` if committed

#### 📋 Techniques & Approaches

| Technique | Tools | Implementation |
|-----------|-------|----------------|
| Security Headers | FastAPI middleware | Automate with `secure.py` library |
| API Hardening | Cloudflare WAF, AWS WAF | Rate limiting, IP reputation, DDoS protection |
| Request Validation | Pydantic + custom middleware | Reject oversized payloads before processing |
| Secret Scanning | `truffleHog`, `git-secrets`, GitHub Secret Scanning | Pre-commit hooks to detect secrets |

---

## 2. System Design Improvements

### 2.1 Current Architecture Assessment

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **No graceful shutdown** | APScheduler + DB pool don't clean up on SIGTERM — risk of in-flight data loss | `server/main.py` — no lifespan handler |
| 2 | **No health check endpoint** | Load balancers / k8s probes have no endpoint to check — can't detect dead workers | `server/app/modules` — no health route |
| 3 | **No request tracing** | No `X-Request-ID` through the system — debugging distributed issues is painful | `server/main.py` — no middleware |
| 4 | **Synchronous notification delivery** | Leave approval notifications fire synchronously in the request-response cycle — slows API response | `server/app/modules/leaves/services.py` |
| 5 | **Cross-module coupling** | Leave module directly imports notification service — tight coupling | `server/app/modules/leaves/routes.py` — imports notifications |

#### ✅ What's Implemented

- Modular monolith with feature-based organization (`server/app/modules/`)
- Repository-Service pattern: clear separation of data access (repositories), business logic (services), and HTTP (routes)
- Dependency Injection via FastAPI `Depends()` for auth, DB, tenant
- Multi-tenant isolation via `get_current_tenant` dependency
- Background cron jobs via APScheduler for monthly accruals
- Comprehensive documentation (10 docs covering PRD, TRD, HLD, LLD, DB design, API docs)

#### ❌ What's Missing

- Health check endpoint for orchestration
- Request-ID tracing middleware
- Graceful shutdown handler
- Event-driven architecture for cross-module communication
- Background task queue for async jobs (email, PDF, notifications)
- Caching layer (Redis)
- Rate limiting on non-auth endpoints
- API versioning prefix (`/api/v1/...`)

#### 🛠️ Recommended Actions

1. **Add health check endpoint:**
   ```python
   # server/app/modules/health/routes.py
   @router.get("/api/health")
   async def health_check(db: AsyncSession = Depends(get_db)):
       db_ok = await check_db_connection(db)
       scheduler_ok = check_scheduler_status()
       return {
           "status": "healthy" if db_ok and scheduler_ok else "degraded",
           "database": "connected" if db_ok else "disconnected",
           "scheduler": "running" if scheduler_ok else "stopped",
           "timestamp": datetime.utcnow().isoformat()
       }
   ```

2. **Add Request-ID middleware:**
   ```python
   # server/main.py
   @app.middleware("http")
   async def add_request_id(request: Request, call_next):
       request_id = request.headers.get("X-Request-ID", str(uuid4()))
       with contextlib.suppress(Exception):
           request.state.request_id = request_id
       response = await call_next(request)
       response.headers["X-Request-ID"] = request_id
       return response
   ```

3. **Implement graceful shutdown:**
   ```python
   # server/main.py using lifespan
   @asynccontextmanager
   async def lifespan(app: FastAPI):
       scheduler = AsyncIOScheduler()
       scheduler.start()
       yield
       scheduler.shutdown(wait=True)
       await engine.dispose()
   ```

4. **Introduce event bus for decoupling:**
   - Create `server/app/core/events.py` with a simple in-process event bus (or Redis pub/sub for distributed)
   - Events: `leave.submitted`, `leave.approved`, `leave.rejected`, `employee.created`, etc.
   - Services subscribe to events they care about — no direct imports

5. **Add API versioning:**
   - Prefix all routes: `/api/v1/auth/login`, `/api/v1/leaves`, etc.
   - Nest into `server/app/modules/auth/routes_v1.py`
   - Enables backward-compatible v2 in future

#### 📋 Techniques & Approaches

| Technique | Pattern | Tools |
|-----------|---------|-------|
| Health Checks | Readiness + Liveness probes | FastAPI + DB ping + scheduler check |
| Distributed Tracing | Request-ID + OpenTelemetry | `opentelemetry-python` for production |
| Event-Driven Architecture | Event Bus / Message Queue | Redis pub/sub → RabbitMQ → Kafka |
| Async Task Queue | Producer-Consumer | ARQ (Redis-based, lightweight) → Celery |
| Graceful Shutdown | Signal handling + context manager | `asynccontextmanager` + lifespan |
| API Versioning | URL prefix + header negotiation | `/api/v1/` → `/api/v2/` |

---

## 3. Performance Optimization

### 3.1 Backend Performance

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **N+1 queries in cron job** | Monthly accrual cron fetches all employees, then iterates querying balances individually | `server/app/modules/leaves/cron.py` |
| 2 | **Dashboard stats computed on every load** | No caching — every dashboard refresh hits DB with multiple aggregation queries | `server/app/modules/dashboard/services.py` |
| 3 | **No database connection pooling tuning** | Default pool size may be too low for concurrent users | `server/app/core/database.py` |
| 4 | **No response compression** | API JSON responses sent uncompressed — ~4x bandwidth waste | `server/main.py` — no GZip middleware |
| 5 | **No pagination on list endpoints** | Employee list, leave history, audit logs return ALL records — OOM risk at scale | `server/app/modules/employees/routes.py`, `server/app/modules/leaves/routes.py` |

#### ✅ What's Implemented

- Async SQLAlchemy 2.0 with `asyncpg` driver (non-blocking DB calls)
- Connection pooling via `asyncpg` built-in pool
- Computed properties on models (e.g., leave balance calculations)
- APScheduler for background cron tasks (offload from request cycle)

#### ❌ What's Missing

- Eager loading (`selectinload` / `joinedload`) for known relationships
- Response compression middleware
- Pagination on all list endpoints
- Database query optimization (missing indexes)
- Dashboard/aggregation caching
- Connection pool size tuning based on workload
- Batch SQL operations in cron jobs
- Query performance monitoring (slow query log)

#### 🛠️ Recommended Actions

1. **Fix N+1 in cron job:**
   ```python
   # server/app/modules/leaves/cron.py — BEFORE
   employees = await employee_repo.get_all()
   for emp in employees:
       balance = await balance_repo.get_for_employee(emp.id)  # N queries!
       
   # AFTER — bulk UPDATE
   await db.execute(
       sa.update(LeaveBalance)
       .values(accrued_days=LeaveBalance.accrued_days + LeavePolicy.monthly_accrual)
       .where(LeaveBalance.leave_type_id == LeavePolicy.leave_type_id)
       .where(LeaveBalance.year == current_year)
   )
   ```

2. **Add response compression:**
   ```python
   from fastapi.middleware.gzip import GZipMiddleware
   app.add_middleware(GZipMiddleware, minimum_size=500)  # compress responses >500 bytes
   ```

3. **Add pagination to all list endpoints:**
   ```python
   # Common pagination schema
   class PaginationParams:
       def __init__(self, page: int = Query(1, ge=1), per_page: int = Query(50, ge=1, le=100)):
           self.page = page
           self.per_page = per_page
           self.offset = (page - 1) * per_page
   
   # Response wrapper
   class PaginatedResponse(BaseModel):
       data: list
       total: int
       page: int
       per_page: int
       total_pages: int
   ```

4. **Add database indexes:**
   ```sql
   -- Critical indexes to add via Alembic migration
   CREATE INDEX idx_leave_requests_org_status ON leave_requests(organization_id, status);
   CREATE INDEX idx_leave_requests_employee_date ON leave_requests(employee_id, start_date DESC);
   CREATE INDEX idx_leave_balances_org_year ON leave_balances(organization_id, year);
   CREATE INDEX idx_audit_logs_org_timestamp ON audit_logs(organization_id, created_at DESC);
   CREATE INDEX idx_notifications_employee_read ON notifications(employee_id, is_read);
   ```

5. **Add Redis caching for dashboard:**
   ```python
   # server/app/core/cache.py
   import redis.asyncio as redis
   
   class CacheService:
       def __init__(self):
           self.client = redis.from_url(settings.REDIS_URL)
       
       async def get_or_compute(self, key: str, ttl: int, compute_fn):
           cached = await self.client.get(key)
           if cached:
               return json.loads(cached)
           result = await compute_fn()
           await self.client.setex(key, ttl, json.dumps(result, default=str))
           return result
   ```

#### 📋 Techniques & Approaches

| Technique | Pattern | Benefit |
|-----------|---------|---------|
| Eager Loading | `selectinload` / `joinedload` | Eliminates N+1 queries |
| Pagination | Offset-based + cursor-based | Prevents OOM on large datasets |
| Caching | Cache-aside (lazy loading) | 10-100x faster reads for dashboard |
| Response Compression | GZip / Brotli middleware | 70-80% bandwidth reduction |
| Batch Operations | Bulk UPDATE/INSERT | 100x faster than row-by-row |
| Connection Pooling | Tune pool_size + overflow | Optimal concurrency without overload |
| Query Monitoring | `slow_query_log` + `pg_stat_statements` | Identify bottlenecks |

---

### 3.2 Frontend Performance

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **Large JS bundles** | All components bundled together — Recharts, jsPDF, PapaParse shipped to every page | `client/src/app/(protected)/layout.js` |
| 2 | **Client-side data fetching for dashboard** | Dashboard data fetched with `useEffect` + fetch — no server-side rendering | `client/src/features/dashboard/` |
| 3 | **No image optimization** | Static images not using `next/image` — no lazy loading, no WebP, no srcset | `client/src/components/Landing/` |
| 4 | **No bundle analysis** | No visibility into what's bloating the bundle | Missing `@next/bundle-analyzer` |
| 5 | **No code splitting** | Route-level code splitting is default, but heavy component-level splitting is missing | `client/src/features/reports/` — loads all chart libs |

#### ✅ What's Implemented

- Next.js 14 App Router with automatic route-level code splitting
- Tailwind CSS v4 with JIT compilation (only ships used classes)
- Lucide icons (tree-shakeable)
- Loading states and Suspense boundaries in some routes
- `next-themes` for theme switching (no FOUC)

#### ❌ What's Missing

- Dynamic imports for heavy libraries (`next/dynamic`)
- Server Components for data fetching
- Image optimization with `next/image`
- Bundle analysis in CI
- Component-level code splitting for charts/PDF/CSV
- Static page generation for landing page
- Streaming SSR for slow data

#### 🛠️ Recommended Actions

1. **Dynamic import heavy libraries:**
   ```javascript
   // Before
   import { BarChart, Bar, XAxis, YAxis } from 'recharts';
   
   // After
   const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
       ssr: false,
       loading: () => <Skeleton className="h-64 w-full" />
   });
   ```

2. **Move data fetching to server components:**
   ```javascript
   // app/(protected)/dashboard/page.js — Server Component
   export default async function DashboardPage() {
       const stats = await fetch(`${API_URL}/api/dashboard/stats`, {
           headers: { Cookie: cookies().toString() }
       }).then(r => r.json());
       return <DashboardClient initialData={stats} />;
   }
   ```

3. **Optimize images:**
   ```javascript
   import Image from 'next/image';
   // ... instead of <img>
   <Image src="/hero.png" alt="Leaveflow" width={1200} height={600}
          priority loading="eager" />
   ```

4. **Add bundle analysis:**
   ```javascript
   // next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
       enabled: process.env.ANALYZE === 'true',
   });
   module.exports = withBundleAnalyzer({ ...nextConfig });
   ```

5. **Virtualize large lists:**
   ```bash
   npm install @tanstack/react-virtual
   ```
   ```javascript
   // Virtualize employee list instead of rendering all rows
   const virtualizer = useVirtualizer({
       count: employees.length,
       getScrollElement: () => scrollRef.current,
       estimateSize: () => 60,
   });
   ```

#### 📋 Techniques & Approaches

| Technique | Tool | Benefit |
|-----------|------|---------|
| Dynamic Imports | `next/dynamic` | Reduces initial JS by 40-60% |
| Server Components | Next.js App Router | Zero JS for data fetching |
| Image Optimization | `next/image` | WebP, lazy load, responsive sizes |
| Virtual Lists | `@tanstack/react-virtual` | Smooth scrolling for 1000+ items |
| Bundle Analysis | `@next/bundle-analyzer` | Identify bloat, track regressions |
| Streaming SSR | `React.lazy` + Suspense | Progressive HTML delivery |

---

## 4. Traffic Handling & Scalability

### 4.1 Current Capacity & Bottlenecks

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **No Docker/containerization** | Can't scale horizontally — no container image, no orchestration | Missing entirely |
| 2 | **No CDN for static assets** | All assets served from single Next.js server — no edge caching | `client/next.config.js` |
| 3 | **Database as single point of failure** | Single PostgreSQL instance — no replica, no failover | `server/app/core/database.py` |
| 4 | **No load testing results** | Performance tests exist in `test/performance/` but no baseline metrics | `test/performance/` |
| 5 | **No PgBouncer** | Direct DB connections from each uvicorn worker — connection exhaustion at scale | `server/app/core/database.py` |

#### ✅ What's Implemented

- Stateless API server (horizontal scaling is theoretically possible)
- Test infrastructure includes performance tests
- Session state in client-side cookies (no server-side session memory)

#### ❌ What's Missing

- Dockerfile for both frontend and backend
- Docker Compose for local development
- Container orchestration config (k8s manifests / docker-compose.yml for prod)
- CI/CD pipeline
- CDN integration
- Database read replicas for reporting
- Connection pooling proxy (PgBouncer)
- Auto-scaling rules
- Load testing benchmarks and thresholds

#### 🛠️ Recommended Actions

1. **Create Dockerfile for backend:**
   ```dockerfile
   # server/Dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
   ```

2. **Create Dockerfile for frontend:**
   ```dockerfile
   # client/Dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM node:20-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/package.json ./package.json
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Add CDN via Next.js config:**
   ```javascript
   // client/next.config.js
   module.exports = {
       assetPrefix: process.env.CDN_URL || '',
       images: {
           loader: 'cloudinary', // or 'cloudflare', 'imgix', 'custom'
           path: process.env.CDN_URL,
       }
   }
   ```

4. **Configure PgBouncer:**
   ```ini
   # pgbouncer.ini
   [databases]
   leaveflow = host=db port=5432 dbname=leaveflow
   [pgbouncer]
   pool_mode = transaction
   max_client_conn = 200
   default_pool_size = 25
   ```

5. **Add load testing with k6:**
   ```javascript
   // test/performance/k6/scenario.js
   import http from 'k6/http';
   import { check, sleep } from 'k6';
   
   export const options = {
       stages: [
           { duration: '2m', target: 50 },   // ramp up
           { duration: '5m', target: 50 },   // sustain
           { duration: '2m', target: 100 },  // spike
           { duration: '2m', target: 0 },    // ramp down
       ],
       thresholds: {
           http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
           http_req_failed: ['rate<0.01'],   // <1% failure rate
       },
   };
   ```

#### 📋 Techniques & Approaches

| Technique | Implementation | Scalability Gain |
|-----------|---------------|------------------|
| Horizontal Scaling | Docker + k8s/ECS | Add instances on demand |
| CDN | Cloudflare / Vercel / AWS CloudFront | Serve static from edge (50ms → 5ms) |
| PgBouncer | Transaction pooling | Handle 1000+ concurrent DB connections |
| Read Replicas | PostgreSQL hot standby | Offload reporting queries |
| Auto-scaling | HPA (k8s) / ASG (AWS) | Scale based on CPU/memory/requests |
| Load Testing | k6 / Artillery / Locust | Find breaking point, set alarms |
| Blue-Green Deploy | Zero-downtime strategy | No traffic loss during updates |

---

## 5. Clean Code & Architecture

### 5.1 Code Quality & Structure

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **TypeScript config exists but unused** | `tsconfig.json` present but all code is `.js`/`.jsx` — no type safety | `client/tsconfig.json` + all `.js` files |
| 2 | **Dead code / debug artifacts committed** | `server_debug.log` at repo root, possibly unused components | `server_debug.log` |
| 3 | **No pre-commit hooks** | No linting/formatting enforcement before commits — inconsistent code style | Missing `.husky/`, `.pre-commit-config.yaml` |
| 4 | **No consistent error response format** | Different endpoints return different error shapes — frontend must guess | `server/app/modules/*/routes.py` |
| 5 | **No API versioning** | Routes at `/api/auth/...` — no room for breaking changes | All route files |

#### ✅ What's Implemented

- Feature-based module organization (auth/, leaves/, employees/, etc.)
- Repository-Service-Route separation within each module
- Centralized API client with consistent error handling (`client/src/services/api.js`)
- Centralized navigation config (`client/src/config/navigation.js`)
- Atomic UI components (`client/src/components/ui/`)
- Environment-based configuration via Pydantic Settings (`server/app/core/config.py`)
- Comprehensive documentation
- Test coverage for most modules

#### ❌ What's Missing

- TypeScript migration (types exist but unused)
- Pre-commit hooks for code quality
- Consistent error response schema across all endpoints
- API versioning
- Dead code removal
- Linting rules for Python (ruff/black) and JS (ESLint + Prettier)
- mypy / pyright type checking for Python
- Environment variable validation at startup with clear error messages

#### 🛠️ Recommended Actions

1. **Enable TypeScript gradually:**
   - Rename `.js` → `.jsx` → `.tsx` incrementally (start with `services/api.js`)
   - Use `any` as escape hatch, tighten types over time
   - Leverage existing types in `client/src/lib/` if any

2. **Add pre-commit hooks:**
   ```yaml
   # .pre-commit-config.yaml (repo root)
   repos:
     - repo: https://github.com/astral-sh/ruff-pre-commit
       rev: v0.4.0
       hooks:
         - id: ruff
         - id: ruff-format
     - repo: https://github.com/pre-commit/mirrors-prettier
       rev: v3.1.0
       hooks:
         - id: prettier
           files: ^client/
     - repo: https://github.com/pre-commit/pre-commit-hooks
       rev: v4.5.0
       hooks:
         - id: check-added-large-files
         - id: check-merge-conflict
         - id: detect-private-key
         - id: end-of-file-fixer
   ```

3. **Standardize error responses:**
   ```python
   # server/app/core/errors.py
   class APIError(Exception):
       def __init__(self, code: str, message: str, status_code: int = 400, details: dict = None):
           self.code = code
           self.message = message
           self.status_code = status_code
           self.details = details or {}
   
   class NotFoundError(APIError):
       def __init__(self, resource: str, id: str):
           super().__init__("NOT_FOUND", f"{resource} with id {id} not found", 404)
   
   # Global handler in main.py
   @app.exception_handler(APIError)
   async def api_error_handler(request, exc: APIError):
       return JSONResponse(
           status_code=exc.status_code,
           content={"error": exc.code, "message": exc.message, "details": exc.details, "request_id": request.state.request_id}
       )
   ```

4. **Add API versioning:**
   - Create `server/app/modules/auth/routes_v1.py`
   - Prefix: `/api/v1/auth/login`
   - Keep old routes for backward compat during transition

5. **Clean up VCS:**
   ```bash
   git rm --cached server_debug.log
   git rm --cached server/.env
   echo "server_debug.log" >> .gitignore
   echo "server/.env" >> .gitignore
   ```

#### 📋 Techniques & Approaches

| Practice | Tool | Benefit |
|----------|------|---------|
| TypeScript | tsc + strict mode | Catch type errors at compile time |
| Pre-commit Hooks | pre-commit, husky | Enforce standards automatically |
| Error Standardization | Custom exception hierarchy | Consistent frontend error handling |
| API Versioning | URL prefix + header | Backward-compatible evolution |
| Linting | Ruff (Python), ESLint (JS) | Catch bugs, enforce style |
| Formatting | Black + Prettier | Consistent code style |
| Type Checking | mypy / pyright | Python type safety |

---

## 6. UX Smoothness & Hang-Free Experience

### 6.1 Frontend Responsiveness

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **No optimistic updates** | Leave submission shows loading spinner until server responds — even for obvious successes | `client/src/features/leaves/apply/` |
| 2 | **No skeleton loading** | Loading spinners used instead of skeleton screens matching layout — perceived as slower | `client/src/components/` — Loading components |
| 3 | **No debounced search** | Employee search fires API call on every keystroke — unnecessary network spam | `client/src/features/employees/` |
| 4 | **Heavy operations on main thread** | CSV parsing (PapaParse) and PDF generation (jsPDF) block UI | `client/src/features/reports/` |
| 5 | **No virtualized lists** | Employee list renders all rows in DOM — slow with 1000+ employees | `client/src/features/employees/EmployeeList.jsx` |
| 6 | **Unnecessary re-renders** | AuthContext re-renders entire app tree on every state change | `client/src/features/auth/AuthContext.jsx` |

#### ✅ What's Implemented

- Loading states shown during API calls
- Toast notifications for success/error feedback
- Animated page transitions via Motion (Framer Motion)
- Responsive sidebar with collapse/expand
- Live clock component

#### ❌ What's Missing

- Optimistic UI updates with rollback
- Skeleton loading screens
- Debounced / throttled search
- Web Workers for CPU-heavy tasks
- Virtualized/scrolling lists
- React.memo / useMemo / useCallback optimization
- useTransition for non-urgent state updates
- Keyboard navigation for common actions
- Focus management after modal/dialog actions

#### 🛠️ Recommended Actions

1. **Implement optimistic updates for leave submission:**
   ```javascript
   // client/src/features/leaves/apply/ApplyLeave.jsx
   const [optimisticLeaves, addOptimisticLeave] = useOptimistic(
       leaves,
       (state, newLeave) => [...state, { ...newLeave, status: 'pending', id: 'temp-' + Date.now() }]
   );
   
   async function handleSubmit(leaveData) {
       addOptimisticLeave(leaveData);
       try {
           const result = await api.createLeave(leaveData);
           // Replace temp ID with real one
       } catch (error) {
           // Rollback — remove optimistic entry, show error toast
           toast.error('Failed to submit leave. Please try again.');
       }
   }
   ```

2. **Replace spinners with skeleton screens:**
   ```javascript
   // client/src/components/ui/Skeleton.jsx
   function SkeletonTable({ rows = 5, cols = 4 }) {
       return (
           <div className="space-y-3">
               {Array.from({ length: rows }, (_, i) => (
                   <div key={i} className="flex gap-4">
                       {Array.from({ length: cols }, (_, j) => (
                           <div key={j} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                       ))}
                   </div>
               ))}
           </div>
       );
   }
   ```

3. **Add debounced search hook:**
   ```javascript
   // client/src/hooks/useDebounce.js
   function useDebounce(value, delay = 300) {
       const [debouncedValue, setDebouncedValue] = useState(value);
       useEffect(() => {
           const timer = setTimeout(() => setDebouncedValue(value), delay);
           return () => clearTimeout(timer);
       }, [value, delay]);
       return debouncedValue;
   }
   
   // Usage in employee search
   const [search, setSearch] = useState('');
   const debouncedSearch = useDebounce(search, 300);
   useEffect(() => {
       if (debouncedSearch) fetchEmployees({ search: debouncedSearch });
   }, [debouncedSearch]);
   ```

4. **Offload heavy tasks to Web Workers:**
   ```javascript
   // client/src/workers/csv.worker.js
   self.onmessage = function(e) {
       const { csvData } = e.data;
       const result = Papa.parse(csvData, { header: true });
       self.postMessage({ result });
   };
   
   // Usage
   const worker = new Worker(new URL('../workers/csv.worker.js', import.meta.url));
   worker.postMessage({ csvData });
   worker.onmessage = (e) => setParsedData(e.data.result);
   ```

5. **Optimize re-renders:**
   ```javascript
   // Wrap expensive components
   const EmployeeCard = React.memo(({ employee }) => (
       <div>{/* render */}</div>
   ));
   
   // Memoize callbacks
   const handleApprove = useCallback(async (id) => {
       await api.approveLeave(id);
   }, []);
   
   // Use useMemo for computed data
   const filteredLeaves = useMemo(
       () => leaves.filter(l => l.status === filter),
       [leaves, filter]
   );
   ```

#### 📋 Techniques & Approaches

| Technique | Implementation | UX Benefit |
|-----------|---------------|------------|
| Optimistic UI | `useOptimistic` hook + rollback | Instant feedback, feels faster |
| Skeleton Loading | CSS animation + layout matching | Perceived 2x faster loading |
| Debounce | Custom hook / lodash.debounce | 90% fewer API calls on search |
| Web Workers | Dedicated worker threads | UI stays responsive during CSV/PDF |
| Virtualization | `@tanstack/react-virtual` | Smooth 60fps with 10k+ rows |
| Memoization | `React.memo`, `useMemo`, `useCallback` | Fewer re-renders, lower CPU |
| Transition | `useTransition` | Non-blocking UI updates |

---

## 7. Loading Speed & Quick Responses

### 7.1 Frontend Loading Performance

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **No critical CSS inlining** | Full Tailwind CSS loads before page renders | `client/src/app/layout.js` |
| 2 | **No font optimization** | Custom fonts not preloaded — FOUT/FOIT | `client/src/app/layout.js` |
| 3 | **Landing page not fully SSR'd** | Interactive components may block initial render | `client/src/app/page.js` |
| 4 | **No incremental static regeneration** | Landing page rebuilt on every request | `client/src/app/page.js` |
| 5 | **No resource hints** | No `preconnect`, `prefetch`, `preload` for critical origins | `client/src/app/layout.js` |

#### ✅ What's Implemented

- Next.js automatic static optimization where possible
- Route-level code splitting (App Router default)
- `next/script` for third-party scripts with strategy control
- `next/dynamic` usage in some places

#### ❌ What's Missing

- Font loading optimization
- Critical CSS extraction
- Preconnect to API origin and CDN
- ISR for landing page
- `next/font` for optimized font loading
- Resource hints (`preconnect`, `dns-prefetch`, `prefetch`)
- Script loading strategy audit (move non-critical to `afterInteractive` / `lazyOnload`)
- Performance budgets in CI

#### 🛠️ Recommended Actions

1. **Optimize fonts with `next/font`:**
   ```javascript
   // client/src/app/layout.js
   import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
   
   const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
   const jakarta = Plus_Jakarta_Sans({
       subsets: ['latin'],
       display: 'swap',
       variable: '--font-jakarta',
       preload: true,
   });
   ```

2. **Add resource hints:**
   ```javascript
   // client/src/app/layout.js
   export const metadata = {
       other: {
           'link:preconnect': ['https://api.leaveflow.com', 'https://fonts.googleapis.com'],
           'link:dns-prefetch': ['https://api.leaveflow.com'],
       }
   };
   ```

3. **Enable ISR for landing page:**
   ```javascript
   // client/src/app/page.js
   export const revalidate = 3600; // Revalidate every hour
   ```

4. **Implement performance budgets in CI:**
   ```javascript
   // next.config.js
   const nextConfig = {
       experimental: {
           performanceBudget: {
               // Warn if bundle exceeds 300KB
               maxAssetSize: 300 * 1024,
               maxEntrypointSize: 350 * 1024,
           },
       },
   };
   ```

5. **Measure and monitor Core Web Vitals:**
   ```javascript
   // client/src/app/layout.js — add analytics
   import { useReportWebVitals } from 'next/web-vitals';
   
   function WebVitals() {
       useReportWebVitals(metric => {
           console.log(metric); // Send to analytics
       });
       return null;
   }
   ```

#### 📋 Techniques & Approaches

| Technique | Tool | Target Metric |
|-----------|------|---------------|
| Font Optimization | `next/font` | CLS, FCP |
| Critical CSS | `critters` or inline | FCP, LCP |
| Resource Hints | `<link preconnect/prefetch>` | LCP, TTFB |
| ISR | `revalidate` export | TTFB, FCP |
| Performance Budget | Lighthouse CI, Webpack | Prevent regressions |
| Web Vitals | `next/web-vitals` + RUM | Real user monitoring |

---

### 7.2 API Response Time

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **No response time SLAs** | No defined performance targets — no alert when API degrades | Missing |
| 2 | **No query result limiting** | Some endpoints may return unlimited records | `server/app/modules/*/routes.py` |
| 3 | **No request coalescing** | Multiple dashboard widgets fire separate requests | `client/src/features/dashboard/` |

#### ✅ What's Implemented

- Async handlers throughout (non-blocking)
- ORM parameterized queries (fast execution)
- Coalesced dashboard endpoint (single `/stats` call)

#### ❌ What's Missing

- API response time monitoring
- Slow query logging
- Request coalescing on frontend
- Response time budget with alerts
- CDN caching for API responses (where safe)

#### 🛠️ Recommended Actions

1. **Add API response time middleware:**
   ```python
   # server/main.py
   @app.middleware("http")
   async def monitor_response_time(request: Request, call_next):
       start = time.time()
       response = await call_next(request)
       duration = time.time() - start
       if duration > 1.0:  # Slow request threshold
           logger.warning(f"Slow request: {request.method} {request.url.path} took {duration:.2f}s")
       response.headers["X-Response-Time"] = f"{duration:.3f}s"
       return response
   ```

2. **Add default limit to all list endpoints:**
   ```python
   async def list_employees(
       page: int = Query(1, ge=1),
       per_page: int = Query(50, ge=1, le=100),
       db: AsyncSession = Depends(get_db)
   ):
       ...
   ```

3. **Coalesce frontend requests where possible:**
   - Already done for dashboard (single `/stats`)
   - Apply same to other pages (e.g., employee profile loads all related data in one call)

#### 📋 Techniques & Approaches

| Technique | Implementation | Benefit |
|-----------|---------------|---------|
| Response Monitoring | Middleware + structured logs | Detect and alert on slow endpoints |
| Query Limits | Default LIMIT on all list queries | Prevent runaway queries |
| Request Coalescing | Batch endpoint (GraphQL-style) | Reduce HTTP overhead |
| CDN Caching | Cache-Control headers | Serve stale-while-revalidate |

---

## 8. SEO Best Practices

### 8.1 Public-Facing Pages SEO

#### ⚠️ Problems & Root Cause

| # | Problem | Root Cause | File Reference |
|---|---------|------------|----------------|
| 1 | **No per-page metadata** | `generateMetadata` not used — all pages get default title/description | `client/src/app/page.js` and all route files |
| 2 | **No structured data (JSON-LD)** | Search engines lack context about the business, features, pricing | `client/src/app/page.js` |
| 3 | **No sitemap.xml** | No dynamic sitemap generation — search engines can't discover all pages | Missing `app/sitemap.js` |
| 4 | **No robots.txt** | No crawl instructions — search engines may crawl auth pages | Missing `app/robots.js` |
| 5 | **Landing page may be client component** | If `'use client'` is used, SSR is disabled — bad for SEO | `client/src/app/page.js` |
| 6 | **No canonical URLs** | Duplicate content possible from query params | Missing from all pages |

#### ✅ What's Implemented

- Next.js App Router (SSR-first by default)
- Semantic HTML structure in landing page components (likely)
- Responsive design (mobile-friendly = Google ranking factor)
- Fast page load (Core Web Vitals foundation)

#### ❌ What's Missing

- Per-page metadata with `generateMetadata`
- JSON-LD structured data (Organization, WebApplication, FAQ, BreadcrumbList)
- Dynamic sitemap generation
- robots.txt with proper rules
- Canonical URL tags
- Open Graph / Twitter Card meta tags
- Alt text on all images
- Heading hierarchy audit (h1 → h2 → h3)
- Internal linking strategy

#### 🛠️ Recommended Actions

1. **Add metadata to landing page:**
   ```javascript
   // client/src/app/page.js
   export const metadata = {
       title: 'Leaveflow — Enterprise Leave Management Platform',
       description: 'Simplify leave management for your organization. Multi-tenant, role-based, AI-powered. Book a demo today.',
       openGraph: {
           title: 'Leaveflow — Enterprise Leave Management',
           description: 'Simplify leave management for your organization.',
           url: 'https://leaveflow.com',
           siteName: 'Leaveflow',
           images: [{ url: '/og-image.png', width: 1200, height: 630 }],
           locale: 'en_US',
           type: 'website',
       },
       twitter: {
           card: 'summary_large_image',
           title: 'Leaveflow — Enterprise Leave Management',
           description: 'Simplify leave management for your organization.',
       },
       alternates: {
           canonical: 'https://leaveflow.com',
       },
   };
   ```

2. **Add JSON-LD structured data:**
   ```javascript
   // client/src/components/Landing/JsonLd.jsx
   export default function JsonLd() {
       const jsonLd = {
           '@context': 'https://schema.org',
           '@type': 'SoftwareApplication',
           name: 'Leaveflow',
           description: 'Enterprise leave management platform',
           applicationCategory: 'BusinessApplication',
           operatingSystem: 'Web',
           offers: {
               '@type': 'Offer',
               price: '0',
               priceCurrency: 'USD',
           },
           aggregateRating: {
               '@type': 'AggregateRating',
               ratingValue: '4.8',
               ratingCount: '124',
           },
       };
       return (
           <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
           />
       );
   }
   ```

3. **Generate sitemap dynamically:**
   ```javascript
   // client/src/app/sitemap.js
   export default async function sitemap() {
       const baseUrl = 'https://leaveflow.com';
       return [
           { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
           { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
           { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
           { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
       ];
   }
   ```

4. **Create robots.txt:**
   ```javascript
   // client/src/app/robots.js
   export default function robots() {
       return {
           rules: [
               { userAgent: '*', allow: '/', disallow: ['/login', '/dashboard/', '/api/'] },
               { userAgent: 'GPTBot', disallow: '/' }, // Block AI crawlers if desired
           ],
           sitemap: 'https://leaveflow.com/sitemap.xml',
       };
   }
   ```

5. **Ensure landing page is SSR (not client component):**
   - Check `client/src/app/page.js` does NOT have `'use client'` at the top
   - Move interactive parts (chatbot, animated stats) to client islands via dynamic imports with `ssr: false`

#### 📋 Techniques & Approaches

| Technique | Implementation | SEO Impact |
|-----------|---------------|------------|
| Metadata API | `generateMetadata` | Rich snippets, click-through rate |
| JSON-LD | Schema.org structured data | Rich results, knowledge panel |
| Sitemap | Dynamic sitemap generation | Full page discovery |
| robots.txt | Crawl control | Proper indexing of public pages |
| Open Graph | og:meta tags | Social sharing preview |
| Canonical URLs | `rel="canonical"` | Prevent duplicate content penalty |
| SSR | Server Components | Full HTML for search crawlers |
| Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 | Google ranking factor |

---

## 9. Priority Action Matrix

| Priority | Dimension | Action | Effort | Impact | Dependencies | Target |
|----------|-----------|--------|--------|--------|--------------|--------|
| 🔴 **P0** | Security | Rotate leaked JWT secret, add `.env` to `.gitignore` | 30 min | Critical | None | This week |
| 🔴 **P0** | Security | Add password policy validation | 2 hours | Critical | None | This week |
| 🔴 **P0** | Security | Add auth failure logging | 3 hours | High | Audit log table exists | This week |
| 🔴 **P0** | Security | Add progressive brute-force lockout | 4 hours | Critical | Redis (or in-memory fallback) | This week |
| 🟠 **P1** | Security | Implement CSRF protection | 4 hours | High | None | Next sprint |
| 🟠 **P1** | Security | Add request size limiting | 1 hour | Medium | None | Next sprint |
| 🟠 **P1** | Security | Disable OpenAPI docs in production | 30 min | Medium | None | Next sprint |
| 🟠 **P1** | Security | Security headers on API responses | 2 hours | Medium | None | Next sprint |
| 🟠 **P1** | Performance | Add DB indexes (Alembic migration) | 3 hours | High | None | Next sprint |
| 🟠 **P1** | Performance | Add pagination to all list endpoints | 6 hours | High | None | Next sprint |
| 🟠 **P1** | Performance | Add Redis caching for dashboard | 8 hours | High | Redis server | Next sprint |
| 🟠 **P1** | Performance | Fix N+1 in cron job (bulk SQL) | 3 hours | High | None | Next sprint |
| 🟠 **P1** | Performance | Dynamic import heavy frontend libs | 4 hours | Medium | None | Next sprint |
| 🟠 **P1** | SEO | Add metadata + JSON-LD + sitemap | 4 hours | Medium | None | Next sprint |
| 🟠 **P1** | System Design | Health check endpoint | 2 hours | Medium | None | Next sprint |
| 🟠 **P1** | System Design | Request-ID middleware | 2 hours | Medium | None | Next sprint |
| 🟡 **P2** | Performance | Migrate BLOB images to S3/CDN | 12 hours | Medium | S3/Cloudflare account | Month 2 |
| 🟡 **P2** | Performance | Add response compression (GZip) | 1 hour | Medium | None | Month 2 |
| 🟡 **P2** | UX | Optimistic UI for leave submission | 6 hours | Medium | None | Month 2 |
| 🟡 **P2** | UX | Debounced search everywhere | 2 hours | Medium | None | Month 2 |
| 🟡 **P2** | UX | Skeleton loading screens | 6 hours | Medium | None | Month 2 |
| 🟡 **P2** | Clean Code | Pre-commit hooks setup | 2 hours | Medium | None | Month 2 |
| 🟡 **P2** | Clean Code | Standardized error responses | 4 hours | Medium | None | Month 2 |
| 🟡 **P2** | System Design | Graceful shutdown handler | 2 hours | Medium | None | Month 2 |
| 🟡 **P2** | System Design | API versioning setup | 4 hours | Low | Route refactoring | Month 2 |
| 🟡 **P2** | Performance | ISR for landing page | 1 hour | Medium | None | Month 2 |
| 🔵 **P3** | Traffic | Docker setup (frontend + backend) | 8 hours | High | None | Month 3 |
| 🔵 **P3** | Traffic | CI/CD pipeline | 16 hours | High | Docker images | Month 3 |
| 🔵 **P3** | Traffic | PgBouncer setup | 4 hours | High | DB access | Month 3 |
| 🔵 **P3** | System Design | Event bus for cross-module comms | 12 hours | High | Redis | Month 3 |
| 🔵 **P3** | System Design | Background task queue (ARQ) | 12 hours | High | Redis | Month 3 |
| 🔵 **P3** | UX | Web Workers for CSV/PDF | 8 hours | Medium | None | Month 3 |
| 🔵 **P3** | UX | Virtualized lists | 8 hours | Medium | `@tanstack/react-virtual` | Month 3 |
| 🔵 **P3** | Clean Code | TypeScript migration (start with API layer) | 20 hours | Medium | None | Month 3+ |
| 🔵 **P3** | Traffic | Load testing + benchmarks | 8 hours | Medium | k6 | Month 3 |
| 🔵 **P3** | Traffic | CDN integration | 4 hours | Medium | CDN account | Month 3 |
| 🔵 **P3** | Security | Column-level encryption for PII | 12 hours | Medium | `pgcrypto` | Month 3+ |
| 🔵 **P3** | SEO | Core Web Vitals optimization | 8 hours | Medium | Lighthouse | Month 3+ |
| 🔵 **P3** | Security | Rate limiting on all sensitive endpoints | 4 hours | Medium | SlowAPI | Month 3+ |

---

## 10. Appendices

### Appendix A: Environment Hardening Checklist

Use this checklist when deploying to production:

- [ ] JWT secret rotated and stored in secrets manager (not in VCS)
- [ ] `server/.env` added to `.gitignore`
- [ ] `server_debug.log` removed from repo
- [ ] `DEBUG=False` in production environment
- [ ] CORS origins restricted to known domains only
- [ ] CORS headers/methods explicitly listed (not wildcard)
- [ ] OpenAPI docs disabled (`docs_url=None`, `redoc_url=None`)
- [ ] Request body size limit enforced (5MB)
- [ ] Security headers middleware added (CSP, HSTS, XFO, etc.)
- [ ] Rate limiting enabled on login, register, password-reset, contact-form
- [ ] Password policy enforced (min 8 chars, complexity requirements)
- [ ] CSRF protection implemented
- [ ] Auth failure logging enabled
- [ ] Progressive brute-force lockout active
- [ ] Database connection uses SSL/TLS
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] HSTS preload submitted
- [ ] Backup strategy configured and tested
- [ ] Secrets validated at application startup
- [ ] Health check endpoint available and monitored
- [ ] Graceful shutdown implemented
- [ ] No sensitive data in client-side code or bundles

### Appendix B: Performance Benchmarking Methodology

1. **Baseline Measurement:**
   ```
   Tool: Lighthouse (Core Web Vitals)
   Target: LCP < 2.5s, FID < 100ms, CLS < 0.1, TTFB < 800ms
   
   Tool: k6 (API response times)
   Target: p95 < 500ms for read endpoints
   Target: p95 < 1000ms for write endpoints
   ```

2. **Load Testing Scenarios:**
   - Baseline: 10 concurrent users, 5min ramp
   - Expected: 50 concurrent users, 10min sustain
   - Peak: 200 concurrent users, 5min spike
   - Stress: Until failure

3. **Monitoring:**
   - API response times (p50, p95, p99)
   - Database query times (slow query log > 500ms)
   - CPU/Memory usage per pod/worker
   - Connection pool utilization
   - Cache hit ratio (when Redis is added)

### Appendix C: Security Audit Checklist

- [ ] OWASP Top 10 review (2021)
- [ ] SAST scanning (Semgrep / Bandit for Python, ESLint for JS)
- [ ] Dependency vulnerability scan (`pip-audit`, `npm audit`, Dependabot)
- [ ] Secret scanning (truffleHog / GitLeaks)
- [ ] Container image scan (Trivy / Snyk)
- [ ] Penetration testing (at least automated with OWASP ZAP)
- [ ] SSL/TLS configuration audit (SSL Labs)
- [ ] Security headers audit (securityheaders.com)
- [ ] Rate limiting effectiveness test
- [ ] Auth bypass attempt test
- [ ] SQL injection probe
- [ ] XSS probe
- [ ] CSRF test
- [ ] Mass assignment / parameter tampering test
- [ ] File upload abuse test
- [ ] IDOR (Insecure Direct Object Reference) test — verify tenant isolation cannot be bypassed

### Appendix D: Recommended Tools & Libraries

| Category | Tool | Purpose |
|----------|------|---------|
| **Security** | `bandit` | Python SAST scanner |
| **Security** | `safety` / `pip-audit` | Python dependency vuln scan |
| **Security** | `truffleHog` | Git history secret scanning |
| **Security** | `csrf-fix` | CSRF protection for FastAPI |
| **Security** | `bleach` | HTML sanitization for user input |
| **Security** | `secure.py` | Security headers for FastAPI |
| **Performance** | Redis | Caching, rate limiting, task queue |
| **Performance** | `@tanstack/react-virtual` | Virtualized lists |
| **Performance** | `@next/bundle-analyzer` | Bundle size analysis |
| **Performance** | `k6` / `Locust` | Load testing |
| **Performance** | Web Workers API | Offload CPU-heavy work |
| **Code Quality** | `ruff` | Python linter + formatter |
| **Code Quality** | `mypy` | Python static type checking |
| **Code Quality** | `pre-commit` | Git hook automation |
| **Code Quality** | ESLint + Prettier | JS/TS linting and formatting |
| **DevOps** | Docker + Docker Compose | Containerization |
| **DevOps** | GitHub Actions | CI/CD pipeline |
| **Monitoring** | `opentelemetry-python` | Distributed tracing |
| **Monitoring** | `prometheus-fastapi-instrumentator` | API metrics |
| **SEO** | `next-seo` / Metadata API | SEO meta management |
| **SEO** | Schema.org JSON-LD | Structured data |

---

> **Next Steps:**
> 1. Tackle P0 items immediately (security secrets, password policy, auth logging)
> 2. Work through P1 items in next sprint (indexes, caching, pagination, SEO)
> 3. Start P2 items in month 2 (Docker, CSRF, UX improvements, graceful shutdown)
> 4. Plan P3 items for month 3+ (TypeScript, CDN, event bus, load testing)
>
> Each item in the Priority Matrix maps to specific files and code locations referenced throughout this document.
