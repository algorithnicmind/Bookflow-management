# Product Requirements Document (PRD)
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  
**Author:** Project Team  

---

## 1. Problem Statement

Organizations face significant challenges managing employee leave requests manually or through fragmented systems:

- **Paper-based or email-based leave requests** cause delays, miscommunication, and lack of accountability
- **Managers lack visibility** into team availability, leading to scheduling conflicts and understaffing
- **Employees have no real-time status updates** on their leave requests, causing frustration and repeated follow-ups
- **HR/Admin teams spend excessive time** tracking leave balances, generating reports, and ensuring policy compliance
- **No centralized dashboard** exists to monitor leave trends and make data-driven staffing decisions

### The Solution

A **web-based Leave Management System** that digitizes the entire leave lifecycle — from application to approval — with role-based access, real-time status tracking, and an analytics dashboard.

---

## 2. Scope Document

### 2.1 In Scope (MVP)

| Feature | Description |
|---------|------------|
| **User Authentication** | Secure login with email/password, JWT-based sessions |
| **Role-Based Access** | Three roles: Employee, Manager, Admin — each with distinct permissions |
| **Leave Application** | Employees can apply for leave with type, date range, and reason |
| **Leave History** | Employees can view all their past and current leave requests |
| **Leave Approval** | Managers can approve or reject leave requests from their direct reports |
| **Employee Management** | Admins can add, edit, and remove employees from the system |
| **Dashboard** | Visual statistics: leave counts, trends, department-wise breakdown |
| **Leave Balance Tracking** | Track remaining leave per type (Casual, Sick, Earned) per year |
| **Input Validation** | Prevent invalid dates, overlapping leaves, empty fields |
| **Responsive UI** | Works on desktop and tablet browsers |

### 2.2 Out of Scope (Future Enhancements)

| Feature | Reason |
|---------|--------|
| Email/SMS Notifications | Requires third-party integration |
| Leave Calendar Integration (Google/Outlook) | Complexity beyond MVP |
| Half-Day / Hourly Leave | Simplifying to full-day leave for MVP |
| Multi-Level Approval Chains | MVP supports single-manager approval |
| Payroll Integration | Separate system concern |
| Mobile Native App | Web-responsive approach covers mobile use cases |
| Holiday Calendar Management | Can be added in v2 |

---

## 3. User Roles & Permissions

### 3.1 Role Definitions

#### 👤 Employee
The primary user of the system. Applies for leave and tracks request status.

**Permissions:**
- Log in to the system
- View personal dashboard with leave balance
- Apply for new leave
- View leave request history and status
- Cancel pending leave requests

#### 👔 Manager
Oversees a team of employees. Responsible for approving or rejecting leave requests.

**Permissions:**
- All Employee permissions
- View pending leave requests from direct reports
- Approve leave requests with optional comments
- Reject leave requests with mandatory reason
- View team leave calendar/overview

#### 🛡️ Admin
System administrator responsible for managing users and system configuration.

**Permissions:**
- All Manager permissions
- Add new employees to the system
- Edit employee details (role, department, manager assignment)
- Remove employees from the system
- View system-wide dashboard and statistics
- Reset employee leave balances

### 3.2 Permissions Matrix

| Action | Employee | Manager | Admin |
|--------|:--------:|:-------:|:-----:|
| Login | ✅ | ✅ | ✅ |
| View Own Dashboard | ✅ | ✅ | ✅ |
| Apply for Leave | ✅ | ✅ | ✅ |
| View Own Leave History | ✅ | ✅ | ✅ |
| Cancel Own Pending Leave | ✅ | ✅ | ✅ |
| View Team Pending Requests | ❌ | ✅ | ✅ |
| Approve/Reject Leave | ❌ | ✅ | ✅ |
| View Team Calendar | ❌ | ✅ | ✅ |
| Add/Edit/Remove Employees | ❌ | ❌ | ✅ |
| View System-Wide Stats | ❌ | ❌ | ✅ |
| Reset Leave Balances | ❌ | ❌ | ✅ |

---

## 4. Leave Types

| Type | Annual Quota | Carry Forward | Description |
|------|:-----------:|:-------------:|-------------|
| **Casual Leave** | 12 days | No | For personal errands, short absences |
| **Sick Leave** | 10 days | No | For medical reasons (doctor's note may be required for 3+ days) |
| **Earned Leave** | 15 days | Yes (max 5) | Accrued leave, typically for planned vacations |
| **Unpaid Leave** | Unlimited | N/A | When all paid leave is exhausted |

---

## 5. Key Business Rules

1. Leave **end date** must be ≥ **start date**
2. Leave **start date** must be ≥ **today** (no retroactive leave)
3. An employee **cannot apply for overlapping dates** with an existing pending/approved leave
4. **Leave balance** must be checked before allowing a paid leave application
5. Only the **assigned manager** can approve/reject an employee's leave
6. A **rejected leave** restores the deducted balance
7. **Cancelled leave** (by employee) is only allowed while status is "Pending"
8. A **reason is mandatory** when rejecting a leave request
