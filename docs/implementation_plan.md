# LeaveFlow Management System — Frontend Implementation Plan

## Executive Summary

Build an enterprise-grade Next.js 14 frontend that integrates with the existing FastAPI backend. The backend is **frozen** — no modifications unless a critical bug is discovered. This plan covers 7 milestones delivering a production-ready, dark-themed SaaS application with full RBAC enforcement.

---

## 1. Current State Analysis

### Backend Architecture (Frozen)

The server runs on FastAPI with a clean modular structure:

```
server/app/
├── core/           → config, database, dependencies (JWT auth), security (bcrypt + JWT)
└── modules/
    ├── auth/       → POST /api/auth/login, POST /api/auth/register
    ├── employees/  → GET/POST/PUT/DELETE /api/employees
    ├── leaves/     → POST /api/leaves, GET history/balance/pending, PUT approve/reject/cancel
    └── dashboard/  → GET /api/dashboard/stats (role-adaptive response)
```

### Backend API Contract (Exact)

| Endpoint | Method | Auth | RBAC | Request Format | Notes |
|----------|--------|------|------|----------------|-------|
| `/api/auth/login` | POST | Public | None | `OAuth2PasswordRequestForm` (form-data: `username` + `password`) | Returns `{access_token, token_type, user}` |
| `/api/auth/register` | POST | Bearer | super_admin, admin | JSON `{name, email, password}` | Creates admin-role user only |
| `/api/employees` | GET | Bearer | admin, super_admin | Query: `?search=` | Returns `{employees: [...]}` |
| `/api/employees` | POST | Bearer | admin, super_admin | JSON `{name, email, password, role, department, manager_id}` | Creates any role |
| `/api/employees/{id}` | PUT | Bearer | admin, super_admin | JSON `{name?, role?, department?, manager_id?}` | Partial update |
| `/api/employees/{id}` | DELETE | Bearer | admin, super_admin | — | Soft deactivation |
| `/api/leaves` | POST | Bearer | Any authenticated | JSON `{leave_type, start_date, end_date, reason}` | `leave_type` must be `casual\|sick\|earned\|unpaid` |
| `/api/leaves` | GET | Bearer | Any authenticated | Query: `?status=all` | Returns own leave history |
| `/api/leaves/balance` | GET | Bearer | Any authenticated | — | Returns `{balances: [...], year}` |
| `/api/leaves/{id}/cancel` | PUT | Bearer | Owner only | — | Only pending leaves |
| `/api/leaves/pending` | GET | Bearer | manager, admin, super_admin | — | Returns `{pending: [...]}` |
| `/api/leaves/{id}/approve` | PUT | Bearer | manager, admin, super_admin | JSON `{comments}` | Manager sees only direct reports |
| `/api/leaves/{id}/reject` | PUT | Bearer | manager, admin, super_admin | JSON `{comments}` | Comments required for rejection |
| `/api/dashboard/stats` | GET | Bearer | Any authenticated | — | Role-adaptive response |

> [!IMPORTANT]
> **Critical: The login endpoint uses `OAuth2PasswordRequestForm`** — this means the frontend must send `application/x-www-form-urlencoded` with fields `username` (not `email`) and `password`. This is NOT a JSON body.

### RBAC Permission Matrix

| Feature | Employee | Manager | Admin | Super Admin |
|---------|:--------:|:-------:|:-----:|:-----------:|
| View own dashboard | ✅ | ✅ | ✅ | ✅ |
| Apply leave | ✅ | ✅ | ✅ | ✅ |
| View own leave history | ✅ | ✅ | ✅ | ✅ |
| Cancel own pending leave | ✅ | ✅ | ✅ | ✅ |
| View leave balance | ✅ | ✅ | ✅ | ✅ |
| View team pending requests | ❌ | ✅ | ✅ | ✅ |
| Approve/Reject leaves | ❌ | ✅ (direct reports) | ✅ (all) | ✅ (all) |
| Team on leave today | ❌ | ✅ | ✅ | ✅ |
| List all employees | ❌ | ❌ | ✅ | ✅ |
| Create employee | ❌ | ❌ | ✅ | ✅ |
| Update employee | ❌ | ❌ | ✅ | ✅ |
| Deactivate employee | ❌ | ❌ | ✅ | ✅ |
| Create admin accounts | ❌ | ❌ | ❌ | ✅ |
| Org-wide analytics | ❌ | ❌ | ✅ | ✅ |

---

## 2. Architecture Decisions

### Technology Choices

| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **Next.js 14 (App Router)** | Framework | SSR/SSG support, file-based routing, React Server Components |
| **TypeScript** | Type safety | Enterprise-grade type safety across all layers |
| **Tailwind CSS v3** | Styling | Utility-first, dark mode built-in, rapid development |
| **shadcn/ui** | Component library | Headless, unstyled primitives — fully customizable |
| **React Hook Form + Zod** | Forms + validation | Type-safe validation with zero-dependency schemas |
| **Axios** | HTTP client | Interceptors for auth token injection, error handling |
| **Zustand** | State management | Minimal boilerplate, TypeScript-first, no providers needed |
| **Framer Motion** | Animations | Declarative animations, layout transitions |
| **Recharts** | Charts | Composable, responsive, dark-mode friendly |
| **Sonner** | Toast notifications | Minimal, beautiful, Tailwind-compatible |
| **date-fns** | Date utilities | Tree-shakeable, immutable operations |

### Frontend Architecture Pattern

```
Feature-Based Architecture with Layered Separation

┌────────────────────────────────────┐
│          Pages (app/)              │  ← Route definitions, layouts
├────────────────────────────────────┤
│       Features (features/)         │  ← Feature-specific components + logic
├────────────────────────────────────┤
│     Shared Components (components/)│  ← Reusable UI components (sidebar, cards)
├────────────────────────────────────┤
│       Services (services/)         │  ← API client layer (Axios wrappers)
├────────────────────────────────────┤
│     Hooks / Store / Types          │  ← Shared state, custom hooks, TS types
├────────────────────────────────────┤
│       Lib / Utils / Constants      │  ← Pure utilities, no side effects
└────────────────────────────────────┘
```

### Folder Structure

```
client/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout (providers, fonts)
│   │   ├── page.tsx                 # Redirect to /login or /dashboard
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   └── (dashboard)/             # Protected route group
│   │       ├── layout.tsx           # Sidebar + Topbar layout
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── apply-leave/
│   │       │   └── page.tsx
│   │       ├── leave-history/
│   │       │   └── page.tsx
│   │       ├── pending-approvals/
│   │       │   └── page.tsx
│   │       ├── employees/
│   │       │   └── page.tsx
│   │       └── analytics/
│   │           └── page.tsx
│   │
│   ├── components/                   # Shared UI components
│   │   ├── ui/                      # shadcn/ui components (Button, Input, Dialog, etc.)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── guards/
│   │   │   └── role-guard.tsx       # RBAC wrapper component
│   │   └── shared/
│   │       ├── status-badge.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── empty-state.tsx
│   │
│   ├── features/                     # Feature modules
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── use-auth.ts
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx
│   │   │   ├── balance-cards.tsx
│   │   │   ├── recent-leaves-table.tsx
│   │   │   └── team-overview.tsx
│   │   ├── leaves/
│   │   │   ├── apply-leave-form.tsx
│   │   │   ├── leave-history-table.tsx
│   │   │   └── leave-filters.tsx
│   │   ├── approvals/
│   │   │   ├── pending-requests-table.tsx
│   │   │   └── approval-dialog.tsx
│   │   ├── employees/
│   │   │   ├── employee-table.tsx
│   │   │   ├── employee-form-dialog.tsx
│   │   │   └── employee-filters.tsx
│   │   └── analytics/
│   │       ├── leave-trend-chart.tsx
│   │       ├── department-chart.tsx
│   │       └── approval-metrics.tsx
│   │
│   ├── services/                     # API client layer
│   │   ├── api-client.ts            # Axios instance with interceptors
│   │   ├── auth.service.ts
│   │   ├── leaves.service.ts
│   │   ├── employees.service.ts
│   │   └── dashboard.service.ts
│   │
│   ├── store/                        # Zustand stores
│   │   └── auth-store.ts            # Token + user state
│   │
│   ├── hooks/                        # Shared custom hooks
│   │   ├── use-api.ts               # Generic data-fetching hook
│   │   └── use-role.ts              # RBAC permission hook
│   │
│   ├── types/                        # TypeScript interfaces
│   │   ├── auth.types.ts
│   │   ├── employee.types.ts
│   │   ├── leave.types.ts
│   │   └── dashboard.types.ts
│   │
│   ├── lib/                          # Library wrappers
│   │   └── utils.ts                 # cn() helper for Tailwind
│   │
│   ├── constants/                    # App-wide constants
│   │   ├── roles.ts                 # Role definitions + permissions
│   │   ├── routes.ts                # Route constants
│   │   └── leave-types.ts           # Leave type config
│   │
│   └── middleware.ts                 # Next.js middleware (auth redirect)
│
├── .env.local                        # NEXT_PUBLIC_API_URL=http://localhost:8000
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json                   # shadcn/ui config
└── package.json
```

---

## 3. Implementation Milestones

### Milestone 1: Project Scaffolding + Design System
**Estimated effort:** Foundation  
**Files:** ~25 new files

#### Tasks:
1. Initialize Next.js 14 with TypeScript + Tailwind + App Router
2. Install and configure shadcn/ui (dark theme)
3. Create design system tokens in Tailwind config (navy gradients, indigo accents, glassmorphism)
4. Build layout shell: Sidebar + Topbar + Mobile Nav
5. Set up Axios client with auth interceptor + error handling
6. Create auth store (Zustand) with token persistence
7. Create TypeScript type definitions matching backend schemas
8. Set up Next.js middleware for protected route redirects
9. Create RBAC utility (`RoleGuard`, `useRole` hook)
10. Create shared components: StatusBadge, LoadingSkeleton, EmptyState

---

### Milestone 2: Authentication System
**Estimated effort:** Medium  
**Files:** ~8 files

#### Tasks:
1. Build login page with glassmorphism card, animated gradient background
2. Create login form with React Hook Form + Zod validation
3. Implement `POST /api/auth/login` integration (form-data format)
4. Store token in Zustand + localStorage
5. Implement role-based redirect after login:
   - `employee` → `/dashboard`
   - `manager` → `/dashboard`
   - `admin` → `/dashboard`
   - `super_admin` → `/dashboard`
6. Implement logout (clear store + redirect)
7. Token expiry detection via Axios interceptor (auto-logout on 401)

---

### Milestone 3: Employee Dashboard
**Estimated effort:** Medium-High  
**Files:** ~10 files

#### Tasks:
1. Build dashboard page consuming `GET /api/dashboard/stats`
2. Leave balance cards with progress indicators (casual, sick, earned)
3. Stats cards (Total Requests, Pending, Approved, Rejected)
4. Recent leaves table (last 5)
5. Quick action buttons ("Apply Leave", "View History")
6. **Manager-specific section:** Team pending count + team on leave today
7. **Admin-specific section:** Org stats (total employees, total requests, department breakdown)
8. Framer Motion staggered card entry animations

---

### Milestone 4: Leave Management Module
**Estimated effort:** High  
**Files:** ~12 files

#### Tasks:
1. **Apply Leave page:**
   - Form with leave type selector (showing remaining balance per type)
   - Date pickers with auto-calculated duration
   - Reason textarea with character count
   - Zod validation (dates, leave type enum, required fields)
   - Integration: `POST /api/leaves`
   - Success toast + redirect to history
2. **Leave History page:**
   - Table with columns: Type, Dates, Days, Reason, Status, Action
   - Status filter dropdown (All, Pending, Approved, Rejected, Cancelled)
   - Cancel button on pending leaves (`PUT /api/leaves/{id}/cancel`)
   - Color-coded status badges
   - Integration: `GET /api/leaves?status=`

---

### Milestone 5: Manager Portal
**Estimated effort:** Medium  
**Files:** ~6 files

#### Tasks:
1. **Pending Approvals page:**
   - Table: Employee Name, Department, Leave Type, Dates, Days, Reason, Actions
   - Integration: `GET /api/leaves/pending`
   - Approve button → Dialog with optional comments → `PUT /api/leaves/{id}/approve`
   - Reject button → Dialog with required comments → `PUT /api/leaves/{id}/reject`
   - Empty state when no pending requests
2. **Team Overview section** (on dashboard):
   - Team members on leave today
   - Pending count badge on sidebar nav item

---

### Milestone 6: Admin & Super Admin Panels
**Estimated effort:** High  
**Files:** ~10 files

#### Tasks:
1. **Employee Management page (Admin):**
   - Employee table with search
   - Integration: `GET /api/employees?search=`
   - "Add Employee" button → Dialog with form (name, email, password, role, department, manager)
   - Integration: `POST /api/employees`
   - Edit button → Dialog with partial update form
   - Integration: `PUT /api/employees/{id}`
   - Deactivate button with confirmation dialog
   - Integration: `DELETE /api/employees/{id}`
2. **Super Admin features:**
   - "Create Admin" form using `POST /api/auth/register`
   - Sidebar navigation items gated by role

---

### Milestone 7: Analytics Dashboard
**Estimated effort:** Medium  
**Files:** ~6 files

#### Tasks:
1. Build analytics page (Admin/Super Admin only)
2. Charts using Recharts:
   - Department-wise employee distribution (bar chart)
   - Leave request status breakdown (pie chart)
   - Organization stats cards
3. All data sourced from `GET /api/dashboard/stats` → `org_stats`
4. Dark-themed chart styling matching design system

---

## 4. Design System Specification

### Color Palette

```
Background:        #0b0c16 → #111326 (gradient)
Card Background:   rgba(255, 255, 255, 0.05) with backdrop-blur-xl
Card Border:       rgba(255, 255, 255, 0.08)
Primary:           #4F46E5 (Electric Indigo)
Primary Hover:     #4338CA
Success:           #10B981 (Emerald)
Warning:           #F59E0B (Amber)
Danger:            #F43F5E (Rose)
Text Primary:      #F1F5F9
Text Secondary:    #94A3B8
Text Muted:        #64748B
```

### Glassmorphism Card Pattern
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Typography
- Font: **Inter** (Google Fonts)
- Headings: `font-semibold`
- Body: `font-normal`

---

## 5. Open Questions

> [!IMPORTANT]
> **Q1:** The API docs mention `PUT /api/settings` and `GET /api/reports/organization` for Super Admin, but these endpoints don't exist in the backend code. Should I skip these pages for now and only build what the backend supports? (Recommended: skip, add later)

> [!IMPORTANT]
> **Q2:** The user prompt specifies both **Tailwind CSS** and **shadcn/ui**. I will proceed with this combination (shadcn/ui is built on Tailwind). The earlier project README mentioned vanilla CSS, but the user's explicit request overrides this. Confirming this is the correct approach.

> [!NOTE]
> **Q3:** The user prompt mentions React Query (TanStack Query), but I plan to use a lighter approach with `useEffect` + Axios + Zustand for this project's scope. React Query adds complexity that may not be justified for ~10 API calls. If you want React Query, I'll include it. (Recommendation: Keep it simple with hooks)

---

## 6. Verification Plan

### Automated
- `npm run build` — Zero TypeScript/build errors
- `npm run lint` — Zero ESLint violations

### Manual Verification
1. Login with all 6 demo credentials → verify correct role-based UI
2. Apply leave → verify balance deduction + request appears in history
3. Cancel pending leave → verify balance restoration
4. Manager: approve/reject → verify status updates
5. Admin: CRUD employees → verify list updates
6. Super Admin: create admin → verify admin account works
7. Responsive testing: mobile, tablet, desktop
8. 401 handling: expired token redirects to login

### Security Checks
- Verify no API calls leak tokens in URL params
- Verify role-gated pages redirect unauthorized users
- Verify sidebar items are hidden based on role
- Verify direct URL access to admin pages by employee redirects to dashboard
