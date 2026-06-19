---
trigger: always_on
---

Let me create the correct version:

```markdown
# Leaveflow Management System — AI Agent Rules

**Project:** Leaveflow (80% Complete, Production Ready: 45%)
**Stack:** Next.js 14 + FastAPI + PostgreSQL + React Context
**Repository:** `algorithnicmind/Leaveflow-management`

---

## 1. PROJECT AWARENESS

**Do NOT:**
- Rewrite working modules (auth, leaves, dashboard, chatbot, settings)
- Add unnecessary tech (no Redux, GraphQL, Django, MongoDB)
- Change business logic (leave types, roles, approval chains are fixed)
- Break multi-tenancy (organization_id filtering is critical)

**Always:**
- Read existing implementation before changing
- Trace data flow (input → validation → db → output → notifications)
- Check side effects (audit logs, notifications, balance updates)
- Ask: "Will this break anything?"
- Understand why code exists before modifying it

---

## 2. CRITICAL BUGS TO FIX (P0)

### Bug #1: Missing `organization_id` on Creation
**Locations:**
- `app/modules/auth/services.py:42-56` — register_admin_user
- `app/modules/employees/services.py:50-58` — create_employee
- `app/modules/leaves/services.py:71-78` — apply_leave
- `app/modules/leaves/services.py:292-297` — approve_leave

**Impact:** Multi-tenant isolation broken, database constraint violations
**Fix:** Pass org_id from `get_current_tenant()` when creating records

### Bug #2: CORS = `["*"]`
**Location:** `server/main.py`
**Fix:** Restrict to actual domain: `allow_origins=["https://leaveflow.com"]`

### Bug #3: JWT_SECRET Hardcoded
**Location:** `app/core/config.py`
**Current:** `JWT_SECRET = os.getenv("JWT_SECRET", "hardcoded-value")`
**Fix:** `JWT_SECRET = os.getenv("JWT_SECRET"); assert JWT_SECRET`

### Bug #4: `.env` in Git
**Action:** Add `.env` to `.gitignore`
**Action:** Rotate all credentials immediately

### Bug #5: Tokens in localStorage
**Risk:** XSS vulnerability
**Fix:** Migrate to HttpOnly cookies (backend: `Set-Cookie` header, frontend: read from response)

### Bug #6: No Rate Limiting
**Endpoint:** `/api/auth/login` (brute force risk)
**Fix:** Install slowapi, limit to 5 requests/minute per IP

---

## 3. CODE QUALITY RULES

**Backend pattern (mandatory):**

```python
# models.py → ORM definitions only
class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    organization_id = Column(Integer, FK, NOT NULL)  # ← ALWAYS

# repositories.py → Database queries only
async def get_by_id(self, id: int, org_id: int, db):
    return await db.execute(
        select(LeaveRequest).where(
            (LeaveRequest.id == id) &
            (LeaveRequest.organization_id == org_id)  # ← MANDATORY
        )
    )

# services.py → Business logic + validation
async def apply_leave(self, req, user_id, org_id, db):
    await self._validate_employee(user_id, org_id, db)
    await self._validate_balance(user_id, req.leave_type, org_id, db)
    leave = await self.repository.create(req, user_id, org_id, db)
    await AuditLogService.log_action(...)
    return leave

# routes.py → Thin HTTP layer
@router.post("/leaves")
async def apply_leave(
    req: LeaveRequestCreate,
    current_user: Employee = Depends(get_current_user),
    current_org: Organization = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    service = LeaveService()
    return await service.apply_leave(req, current_user.id, current_org.id, db)
```

**Frontend pattern (mandatory):**

```jsx
export default function ComponentName({ prop1 }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => { fetchData(); }, []);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return null;
  return <div>{/* content */}</div>;
}
```

**Principles:**
- Single Responsibility (one job per class)
- Keep functions <50 lines
- Remove duplicate code (get_business_days exists twice)
- Use existing components before creating new ones
- Type everything (type hints in Python, types in JavaScript)

**Naming:**
- Python: `snake_case`
- JavaScript: `camelCase`
- Database: `snake_case`, plural tables

---

## 4. FRONTEND RULES (Next.js)

**Structure:**
- All pages in `src/app/`
- Protected pages in `src/app/(protected)/`
- Components in `src/components/`
- Contexts in `src/context/`
- API calls via `src/services/api.js`

**Component requirements:**
- Handle 3 states: loading → error → content
- Use existing UI: `<Button>`, `<Card>`, `<Badge>`, `<Modal>`
- Use `useContext(AuthContext)` for global auth state
- Use `useState` for local state only

**API integration:**
- All calls through `src/services/api.js`
- Handle 401: Clear token, redirect to login
- Always show loading and error states
- Never expose API key in code

**Responsive:**
- Mobile-first design
- Test on 375px, 768px, 1024px
- Sidebar hides on mobile: `hidden md:block`

**Accessibility:**
- All buttons need text
- All images need `alt` text
- Labels linked to inputs
- Color contrast ≥4.5:1
- Semantic HTML: `<button>`, `<input>`, `<label>`

---

## 5. BACKEND RULES (FastAPI)

**Always:**
- Filter by `organization_id` in EVERY query
- Validate in Pydantic schema AND service layer
- Catch exceptions, raise HTTPException
- Log errors (never log secrets)
- Use async/await consistently
- Call `AuditLogService.log_action()` on all CRUD

**Never:**
- Query DB directly in routes
- Put logic in repositories
- Use string concatenation in SQL
- Skip role checks
- Remove auth from endpoints
- Use `create_all()` in production

**Status codes:**
- `200` — Success
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not Found
- `422` — Business logic failure (insufficient balance)
- `500` — Server Error

---

## 6. DATABASE RULES

**Never:**
- Delete columns without migration
- Remove foreign keys
- Use `create_all()` in production
- Skip `organization_id` filtering
- Break existing relationships

**Always:**
- Use Alembic migrations
- Filter by `organization_id` in all queries
- Test migrations on staging first
- Include rollback plan

**14 frozen tables:**
Organizations, Employees, LeaveRequests, LeaveApprovals, LeaveBalances, SystemSettings, PublicHolidays, ApprovalChains, ApprovalSteps, LeavePolicy, AccrualLogs, Notifications, AuditLogs, ContactMessages

---

## 7. AUTHENTICATION & AUTHORIZATION

**4 roles (fixed):**
- `super_admin` — Full access
- `admin` — Manage org, approve, logs
- `manager` — Approve team, team view
- `employee` — Apply, view balance, chatbot

**Login flow (preserve):**
1. POST email+password → `/api/auth/login`
2. Validate with bcrypt
3. Return JWT (HS256, 24h)
4. Frontend stores in localStorage (TODO: migrate to HttpOnly)
5. Include `Authorization: Bearer <token>` in requests

**Protect:**
- Frontend: `(protected)/` folder requires token
- Backend: `Depends(get_current_user)` required
- Always check role: `Depends(RoleChecker([...]))`

---

## 8. SECURITY RULES

**Critical:**
- ❌ No hardcoded secrets (use environment variables)
- ❌ No secrets in logs
- ❌ No `.env` in Git
- ❌ No secrets in error messages
- ✅ Use `SecretStr` for sensitive config
- ✅ Validate all input
- ✅ Use parameterized queries only

**Environment variables (.env, never commit):**
```
JWT_SECRET=<32+ random chars>
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
GEMINI_API_KEY=<key>
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Prevent:**
- SQL injection: Use SQLAlchemy ORM (parameterized)
- XSS: React auto-escapes (never use `dangerouslySetInnerHTML`)
- CSRF: Add CSRF tokens (TODO)
- Brute force: Add rate limiting on login (TODO)

---

## 9. AI CHATBOT RULES

**Architecture (preserve):**
- `bot/router.py` — FastAPI endpoint
- `bot/service.py` — State machine (preserve, 6.7 KB)
- `bot/llm.py` — Gemini API + fallback (preserve, 8.7 KB)
- `bot/actions.py` — DB actions
- `bot/policies.py` — Knowledge base

**Session state:**
- Remember user context across messages
- Store conversation history
- Track intents
- Handle multi-turn conversations

**Failures:**
- Gemini fails → Fall back to rule-based
- Timeout → Return helpful message
- Never crash chatbot

**API key:**
- Store in `GEMINI_API_KEY` env variable
- Use `SecretStr` in Pydantic
- Never log or return key

---

## 10. DEBUGGING RULES

**Process:**
1. Read error message
2. Reproduce locally
3. Find root cause
4. Check related files
5. Plan minimum fix

**After fixing:**
- Check imports work
- Run tests
- Verify APIs work
- Check side effects
- Search for similar bugs

---

## 11. TESTING RULES

**P0 (must test):**
- Login/authentication
- Leave application + balance
- Approval workflow
- Multi-tenant isolation (org_id)
- Role-based access

**P1 (should test):**
- Employee CRUD
- Dashboard stats
- Cron jobs
- Chatbot

---

## 12. DEPLOYMENT RULES

**Before committing:**
- ✅ No hardcoded secrets
- ✅ Error handling complete
- ✅ Secrets safe
- ✅ Performance acceptable
- ✅ Tests passing
- ✅ Docs updated

**Never commit:**
- ❌ `echo=True` on SQLAlchemy
- ❌ `console.log()` statements
- ❌ Mock data
- ❌ TODO without issue number
- ❌ `.env` file

---

## 13. WORKING STYLE

**Explain important changes:**
State what you're changing, why, impact, files affected, risk level, tests.

**Ask before:**
- Architecture changes
- Folder structure changes
- Database schema changes
- Auth flow changes
- New dependencies

**Don't ask before:**
- Fixing bugs
- Adding type hints
- Improving names
- Splitting functions
- Removing duplicates

**Principles:**
- Improve existing code (don't replace)
- Keep clean (no debug code, unused imports)
- Shallow diffs (focused changes)
- Test frequently
- Document as you go

---

## QUICK CHECKLIST

**Before change:**
- [ ] Understand existing code
- [ ] Check if breaks anything
- [ ] Read related files
- [ ] Plan minimum changes

**After change:**
- [ ] No hardcoded secrets
- [ ] No debug statements
- [ ] Tests pass
- [ ] Related files checked
- [ ] `organization_id` included
- [ ] Error handling complete
- [ ] Docs updated

---

**Last Updated:** June 19, 2026
**Key:** Preserve working code, follow patterns, security first
```