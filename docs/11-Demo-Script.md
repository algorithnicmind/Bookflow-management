# Product Demo Script
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  
**Presenter:** Project Team  
**Duration:** 15–20 minutes  

---

## 1. Opening — The Problem (2 minutes)

### Talking Points

> "Today we're presenting the Leave Management System — a solution we built to eliminate the chaos of managing employee leaves manually."

**Pain points to highlight:**

| # | Problem | Real-World Impact |
|:-:|---------|-------------------|
| 1 | Paper/email-based leave requests | Delays, lost requests, no audit trail |
| 2 | Managers lack team visibility | Scheduling conflicts, understaffing |
| 3 | Employees have no status updates | Frustration, repeated follow-ups |
| 4 | HR spends hours tracking balances | Manual errors, policy non-compliance |
| 5 | No centralized dashboard | Unable to make data-driven decisions |

> "Our system digitizes the entire leave lifecycle — from application to approval — with real-time tracking and role-based dashboards."

---

## 2. Solution Overview — Features (2 minutes)

### Key Features to Demo

```
┌──────────────────────────────────────────────────────────┐
│                    LEAVE MANAGEMENT SYSTEM                │
├────────────┬────────────┬──────────────┬─────────────────┤
│ 🔐 Secure  │ 📋 Leave   │ ✅ Approval  │ 📊 Analytics   │
│    Login   │    Apply   │   Workflow   │   Dashboard    │
├────────────┼────────────┼──────────────┼─────────────────┤
│ JWT Auth   │ 4 Types    │ Approve/     │ Leave Stats    │
│ Role-Based │ Validation │ Reject with  │ Dept Breakdown │
│ Access     │ Balance    │ Comments     │ Monthly Trends │
│            │ Tracking   │ Audit Trail  │                │
└────────────┴────────────┴──────────────┴─────────────────┘
```

### Roles Covered
- **Employee** — Apply leave, track status, view balance
- **Manager** — Approve/reject team requests
- **Admin** — Manage employees, view org-wide analytics
- **Super Admin** — Create admins, configure system

---

## 3. Live Demo — User Journey (10 minutes)

### 🎯 Demo Flow Sequence

Follow this exact sequence for a smooth, logical demo:

---

### Demo Step 1: Employee Login & Dashboard (2 min)

**Account:** `john@company.com` / `password123`

**Show:**
1. Open the application → Login page with dark glassmorphism design
2. Enter employee credentials → Click Login
3. **Dashboard loads** → Point out:
   - Leave balance cards (Casual: 9/12, Sick: 9/10, Earned: 15/15)
   - Recent leave requests with color-coded status badges
   - Quick action button "Apply for Leave"

**Key talking point:**
> "When an employee logs in, they immediately see their leave balances and recent request status — no need to ask HR."

---

### Demo Step 2: Apply for Leave (2 min)

**Show:**
1. Click "Apply for Leave" from dashboard
2. Select **Leave Type** → "Casual Leave" (show balance updates)
3. Select **Start Date** → Pick a future date
4. Select **End Date** → System auto-calculates duration
5. Enter **Reason** → "Family celebration"
6. Click **Submit** → Show success confirmation

**Then demonstrate validation:**
- Try end date before start date → Show error message
- Try a past start date → Show error message

**Key talking point:**
> "The system validates everything — date ranges, overlapping leaves, and balance checks — before the request reaches the manager."

---

### Demo Step 3: Manager Approval (3 min)

**Account:** `alice@company.com` / `password123`

**Show:**
1. **Logout** as employee → Login as Manager
2. **Manager Dashboard** → Point out:
   - Pending requests count badge (highlighted)
   - Team members on leave today
3. Navigate to **Pending Requests**
4. Show John's leave request in the queue
5. Click **Approve** → Add optional comment "Enjoy your time off!"
6. Click **Confirm** → Status changes to "Approved"

**Then demonstrate rejection:**
- Show another pending request
- Click **Reject** → Show mandatory reason field
- Enter rejection reason → Confirm
- Explain: "Balance is automatically restored on rejection"

**Key talking point:**
> "Managers see only their direct reports' requests. The system enforces organizational hierarchy automatically."

---

### Demo Step 4: Employee Sees Updated Status (1 min)

**Account:** `john@company.com` / `password123`

**Show:**
1. Log back in as Employee
2. Navigate to **Leave History**
3. Show the leave now has "Approved" status (green badge)
4. Show the updated leave balance

**Key talking point:**
> "The employee sees real-time status updates without needing to email or call the manager."

---

### Demo Step 5: Admin Panel (2 min)

**Account:** `admin@company.com` / `password123`

**Show:**
1. Login as Admin → Show Admin Dashboard with org-wide stats
2. Navigate to **Employee Management**
   - Show employee list with search functionality
   - Click **Add Employee** → Show the form (name, email, role, department, manager)
   - Show that default leave balances are auto-created
3. Navigate to **Dashboard**
   - Show organization-wide statistics
   - Department-wise leave breakdown
   - Monthly trend data

**Key talking point:**
> "Admins have complete visibility into the organization. They can manage staff and monitor leave patterns to make informed decisions."

---

## 4. Technical Architecture Highlight (2 minutes)

### Architecture at a Glance

```
   User → Next.js Frontend → Nginx Gateway → FastAPI Backend → PostgreSQL
              (React)          (Rate Limit)      (Python)        (Database)
```

**Points to mention:**
- **Frontend:** Next.js with App Router — modern React framework with premium dark UI
- **Backend:** FastAPI (Python) — high-performance REST API with auto-generated Swagger docs
- **Database:** PostgreSQL — ACID-compliant relational database with foreign keys and constraints
- **Security:** JWT authentication, bcrypt password hashing, Nginx rate limiting
- **Design:** Glassmorphism cards, micro-animations, responsive layout

---

## 5. Testing Summary (1 minute)

| Metric | Value |
|--------|:-----:|
| Total Test Scenarios | 45 |
| Total Test Cases | 21+ |
| Negative/Edge Cases | 8 |
| Feature Areas Covered | 7 |

**Testing highlights:**
- Functional testing across all user roles
- Negative testing (XSS attempts, invalid dates, unauthorized access)
- Role-based access control verification
- Bug tracking with severity classification

---

## 6. Future Improvements (1 minute)

| Enhancement | Benefit |
|-------------|---------|
| 📧 Email/SMS Notifications | Instant alerts on status changes |
| 📅 Calendar Integration | Sync with Google/Outlook calendars |
| ⏱️ Half-Day Leave Support | More flexible leave options |
| 📱 Mobile App | Native mobile experience |
| 🔗 Multi-Level Approvals | Department Head → HR → Manager chain |
| 💰 Payroll Integration | Auto-calculate leave impact on salary |
| 🎄 Holiday Calendar | Organization-wide holiday management |

---

## 7. Closing & Q&A (1 minute)

### Summary Statement

> "We built a complete Leave Management System that solves real business problems:
> - Employees get self-service leave management with real-time tracking
> - Managers get instant visibility into team availability
> - Admins get data-driven insights for organizational planning
> - The system enforces business rules automatically, reducing human error
>
> Thank you! We're happy to take questions."

---

## 8. Demo Checklist — Pre-Demo Preparation

Before the demo, verify:

- [ ] Backend server is running (`uvicorn main:app --port 8000`)
- [ ] Frontend server is running (`npm run dev` on port 3000)
- [ ] PostgreSQL database is up with seeded demo data
- [ ] All demo accounts are working:
  - [ ] `john@company.com` (Employee)
  - [ ] `alice@company.com` (Manager)
  - [ ] `admin@company.com` (Admin)
  - [ ] `superadmin@company.com` (Super Admin)
- [ ] Browser is in incognito mode (clean session)
- [ ] Screen resolution is optimal for projection
- [ ] At least one "Pending" leave request exists for manager demo
- [ ] Network is stable (if deploying remotely)

---

## 9. Common Q&A Preparation

| Potential Question | Prepared Answer |
|-------------------|-----------------|
| "Why FastAPI over Node/Express?" | FastAPI offers native async support, auto-generated Swagger docs, Pydantic type safety, and performance comparable to Go/Node |
| "Why PostgreSQL over MongoDB?" | Leave management requires ACID transactions for balance updates and relational integrity between employees, leaves, and approvals |
| "How is security handled?" | JWT tokens for stateless auth, bcrypt for password hashing, Nginx for rate limiting, parameterized queries to prevent SQL injection |
| "Can this scale?" | Yes — FastAPI's async nature handles concurrent requests efficiently, and PostgreSQL supports connection pooling for high loads |
| "What about mobile?" | The UI is responsive for tablet browsers. A dedicated mobile app is planned as a future enhancement |
