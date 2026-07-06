# Product Requirements Document (PRD)
## Leave Management System

**Version:** 2.0  
**Date:** June 2026  
**Author:** Project Team  

---

## 1. Problem Statement

Organizations face significant challenges managing employee leave requests manually or through fragmented systems:

- **Paper-based or email-based leave requests** cause delays, miscommunication, and lack of accountability
- **Managers lack visibility** into team availability, leading to scheduling conflicts and understaffing
- **Employees have no real-time status updates** on their leave requests, causing frustration and repeated follow-ups
- **Admin teams spend excessive time** tracking leave balances, generating reports, and ensuring policy compliance
- **No centralized dashboard** exists to monitor leave trends and make data-driven staffing decisions

### The Solution

A **Multi-Tenant B2B web-based Leave Management System** that digitizes the entire leave lifecycle. It features a premium, public-facing landing page for prospective clients and a comprehensive internal dashboard. Organizations can onboard securely through a manual verification process, after which they are provisioned a dedicated workspace. The platform provides robust role-based access, multi-tier approval chains, holiday management, real-time status tracking, and a centralized analytics dashboard.

---

## 2. Scope Document

### 2.1 In Scope (MVP & v1.x)

| Feature | Description |
|---------|------------|
| **Multi-Tenant B2B Architecture** | Separate data workspaces for different client organizations. |
| **Enterprise Onboarding** | Landing page with pricing, OAuth/Email signup, and contact application forms for manual Sales provisioning. |
| **User Authentication** | Secure login with email/password or OAuth (Google), utilizing HttpOnly cookies for session management to prevent XSS |
| **Role-Based Access** | Dynamic roles per organization with fixed underlying permissions |
| **Leave Application** | Employees can apply for leave with type, date range, and reason |
| **Leave Approval Chains** | Managers can approve/reject, with support for multi-tier dynamic approval workflows |
| **System Settings & Holidays** | Admins can configure global rules, approval chains, and company-wide holiday calendars |
| **Employee Management** | Admins can add, edit, and remove employees, assigning them to departments and managers |
| **Dashboard & Analytics** | Visual statistics: leave counts, trends, department-wise breakdown |
| **Leave Balance Tracking** | Track remaining leave per type (Casual, Sick, Earned) per year |
| **Premium UI/UX** | Dark-mode, glassmorphism design with floating dock navigation and responsive layouts |
| **AI Chatbot Assistant** | Integrated Gemini-powered AI chatbot for instant context-aware assistance and policy queries |

### 2.2 Out of Scope (Future Enhancements)

| Feature | Reason |
|---------|--------|
| Email/SMS Notifications | Requires third-party integration (SendGrid/Twilio) |
| Leave Calendar Integration (Google/Outlook) | Complexity beyond current phase |
| Half-Day / Hourly Leave | Simplifying to full-day leave for current release |
| Payroll Integration | Separate system concern |
| Mobile Native App | Web-responsive approach covers mobile use cases |

---

## 3. User Roles & Permissions

### 3.1 Dynamic Roles (New Architecture)

The system uses a completely dynamic role architecture per tenant. Organizations can create their own custom roles (e.g., "HR Manager", "Team Lead", "Senior Developer") and assign specific system permissions to them.

Fixed permissions dictate access control across the application:
- `manage_settings`: Configure organization settings, holidays, and leave types.
- `manage_employees`: Add, edit, or remove employees and manage their role assignments.
- `approve_leaves`: View and approve/reject leave requests from assigned team members.
- `view_reports`: Access organization-wide analytics and leave reports.
- Basic permissions (implied for all authenticated users): View own dashboard, apply for leave, view own history.

#### 👑 Super Admin (Initial Tenant Owner)
When a tenant is created, the initial account is granted a Super Admin role that typically has all available permissions to configure the workspace.

#### ⚙️ Platform Owner (System Operators)
The internal LeaveFlow team that manages the platform globally.
**Permissions:**
- Built-in `manage_everything` permission
- Review incoming onboarding applications from the Landing Page
- Verify identities and provision new workspaces/organizations
- Deep Impersonation: Can impersonate *any* employee across any tenant for support purposes
- View system-wide metrics and connected tenants

### 3.2 Permissions Matrix

Instead of a fixed role matrix, access is evaluated at the route level using a `PermissionChecker`.

| Action | Required Permission |
|--------|---------------------|
| Login | (None - valid JWT) |
| View Own Dashboard | (None - valid JWT) |
| Apply for Leave | (None - valid JWT) |
| View Own Leave History | (None - valid JWT) |
| Cancel Own Pending Leave | (None - valid JWT) |
| View Team Pending Requests | `approve_leaves` |
| Approve/Reject Leave | `approve_leaves` |
| View Team Calendar | `approve_leaves` |
| Add/Edit/Remove Employees | `manage_employees` |
| Create Custom Roles | `manage_settings` |
| Manage System Settings | `manage_settings` |
| View Organization Reports | `view_reports` |
| Manage Tenants/Billing | Platform Owner only |

---

## 4. Dynamic Leave Types

Leave types are fully dynamic and configurable on a per-tenant basis by the Super Admin from the Organization Settings dashboard. 

Each Leave Type supports:
- Custom Name (e.g., Vacation, Sick Leave, Parental)
- Default Days allocated per year
- Paid / Unpaid designation

*(Note: Carry forward policies and half-day increments are planned for future phases. For now, all leave balances reset manually or annually as configured).*
## 5. Key Business Rules

1. Leave **end date** must be ≥ **start date**
2. Leave **start date** must be ≥ **today** (no retroactive leave)
3. An employee **cannot apply for overlapping dates** with an existing pending/approved leave
4. **Leave balance** must be checked before allowing a paid leave application
5. Only the **assigned manager** can approve/reject an employee's leave
6. A **rejected leave** restores the deducted balance
7. **Cancelled leave** (by employee) is only allowed while status is "Pending"
8. A **reason is mandatory** when rejecting a leave request
