# User Stories
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  

---

## Priority Legend
- 🔴 **Must Have** — Critical for MVP launch
- 🟡 **Should Have** — Important but not blocking
- 🟢 **Nice to Have** — Future enhancement

---

## 1. Authentication

### US-001: Employee Login 🔴
**As an** Employee/Manager/Admin,  
**I want to** log in with my email and password,  
**So that** I can access the system securely.

**Acceptance Criteria:**
- [ ] User enters valid email and password → redirected to role-based dashboard
- [ ] Invalid credentials → error message "Invalid email or password"
- [ ] Empty fields → validation error "Please fill in all fields"
- [ ] Session persists via JWT token (stored in localStorage)
- [ ] Token expires after 24 hours → user must re-login

### US-002: User Logout 🔴
**As a** logged-in user,  
**I want to** log out of the system,  
**So that** my session is securely ended.

**Acceptance Criteria:**
- [ ] Clicking "Logout" clears JWT token and redirects to login page
- [ ] After logout, accessing dashboard redirects to login

---

## 2. Employee — Leave Application

### US-003: Apply for Leave 🔴
**As an** Employee,  
**I want to** apply for leave by specifying type, dates, and reason,  
**So that** my manager can review and approve it.

**Acceptance Criteria:**
- [ ] Form fields: Leave Type (dropdown), Start Date, End Date, Reason (textarea)
- [ ] All fields are required
- [ ] End date must be ≥ start date
- [ ] Start date must be ≥ today
- [ ] Cannot apply if overlapping with existing pending/approved leave
- [ ] Sufficient leave balance required for paid leave types
- [ ] On success → confirmation message, leave appears in history as "Pending"
- [ ] Leave balance is deducted upon application

### US-004: View Leave History 🔴
**As an** Employee,  
**I want to** view all my leave requests and their statuses,  
**So that** I can track which leaves are pending, approved, or rejected.

**Acceptance Criteria:**
- [ ] Table shows: Leave Type, Start Date, End Date, Reason, Status, Applied On
- [ ] Status is color-coded: Pending (amber), Approved (green), Rejected (red)
- [ ] List is sorted by most recent first
- [ ] Filterable by status (All, Pending, Approved, Rejected)

### US-005: View Leave Balance 🔴
**As an** Employee,  
**I want to** see my remaining leave balance by type,  
**So that** I know how many leaves I have available.

**Acceptance Criteria:**
- [ ] Dashboard shows cards for each leave type
- [ ] Each card displays: Total Allocated, Used, Remaining
- [ ] Color changes when balance is low (< 3 remaining)

### US-006: Cancel Pending Leave 🟡
**As an** Employee,  
**I want to** cancel a leave request that is still pending,  
**So that** I can withdraw my request before the manager acts on it.

**Acceptance Criteria:**
- [ ] Cancel button visible only for "Pending" leaves
- [ ] Confirmation dialog before cancellation
- [ ] On cancel → status changes to "Cancelled", balance is restored
- [ ] Cannot cancel approved or rejected leaves

---

## 3. Manager — Approval Workflow

### US-007: View Pending Leave Requests 🔴
**As a** Manager,  
**I want to** view all pending leave requests from my team members,  
**So that** I can review and act on them.

**Acceptance Criteria:**
- [ ] Table shows: Employee Name, Leave Type, Start Date, End Date, Reason, Applied On
- [ ] Only shows requests from direct reports (employees assigned to this manager)
- [ ] Sorted by oldest first (FIFO)
- [ ] Badge shows count of pending requests

### US-008: Approve Leave Request 🔴
**As a** Manager,  
**I want to** approve a leave request,  
**So that** the employee can take their planned leave.

**Acceptance Criteria:**
- [ ] "Approve" button available for each pending request
- [ ] Optional comments field for manager
- [ ] On approval → status changes to "Approved"
- [ ] Approval record created with manager ID and timestamp
- [ ] Employee sees updated status in their history

### US-009: Reject Leave Request 🔴
**As a** Manager,  
**I want to** reject a leave request with a reason,  
**So that** the employee understands why their leave was denied.

**Acceptance Criteria:**
- [ ] "Reject" button available for each pending request
- [ ] Rejection reason is **mandatory**
- [ ] On rejection → status changes to "Rejected"
- [ ] Leave balance is restored to the employee
- [ ] Employee sees rejection reason in their history

### US-010: View Team Overview 🟡
**As a** Manager,  
**I want to** see an overview of my team's leave status,  
**So that** I can manage team availability.

**Acceptance Criteria:**
- [ ] Shows list of team members with current leave status
- [ ] Indicates who is currently on leave, who has upcoming leave
- [ ] Displays team leave balance summary

---

## 4. Admin — Employee Management

### US-011: View All Employees 🔴
**As an** Admin,  
**I want to** view a list of all employees in the system,  
**So that** I can manage the workforce.

**Acceptance Criteria:**
- [ ] Table shows: Name, Email, Role, Department, Manager, Status
- [ ] Searchable by name or email
- [ ] Sortable by columns

### US-012: Add New Employee 🔴
**As an** Admin,  
**I want to** add a new employee to the system,  
**So that** they can start using the leave management system.

**Acceptance Criteria:**
- [ ] Form fields: Name, Email, Password, Role (dropdown), Department, Manager (dropdown)
- [ ] Email must be unique
- [ ] Default leave balances are auto-created for the new year
- [ ] On success → employee appears in the list

### US-013: Edit Employee 🟡
**As an** Admin,  
**I want to** edit an employee's details,  
**So that** I can update roles, departments, or manager assignments.

**Acceptance Criteria:**
- [ ] Editable fields: Name, Role, Department, Manager
- [ ] Email cannot be changed (used as identifier)
- [ ] Changes take effect immediately

### US-014: Remove Employee 🟡
**As an** Admin,  
**I want to** remove an employee from the system,  
**So that** former employees no longer have access.

**Acceptance Criteria:**
- [ ] Confirmation dialog before deletion
- [ ] Soft-delete (mark as inactive) rather than hard-delete
- [ ] Inactive employees cannot log in
- [ ] Historical leave data is preserved

---

## 5. Dashboard & Analytics

### US-015: Employee Dashboard 🔴
**As an** Employee,  
**I want to** see a personal dashboard when I log in,  
**So that** I get a quick overview of my leave status.

**Acceptance Criteria:**
- [ ] Shows leave balance cards (by type)
- [ ] Shows recent leave request status
- [ ] Quick-action button to apply for new leave

### US-016: Manager Dashboard 🔴
**As a** Manager,  
**I want to** see a management dashboard,  
**So that** I can quickly see pending items and team status.

**Acceptance Criteria:**
- [ ] Shows count of pending approvals (prominent)
- [ ] Shows team members currently on leave
- [ ] Quick access to approval queue

### US-017: Admin Dashboard 🟡
**As an** Admin,  
**I want to** see system-wide statistics,  
**So that** I can monitor leave trends across the organization.

**Acceptance Criteria:**
- [ ] Total leave requests (by status)
- [ ] Department-wise leave distribution
- [ ] Monthly leave trend chart
- [ ] Employee count and role distribution

---

## User Story Map

```
                    ┌─────────────────────────────────────┐
                    │        LEAVE MANAGEMENT SYSTEM       │
                    └─────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
   ┌────▼────┐                  ┌─────▼─────┐               ┌──────▼──────┐
   │ EMPLOYEE │                  │  MANAGER  │               │    ADMIN    │
   └────┬────┘                  └─────┬─────┘               └──────┬──────┘
        │                             │                             │
   ┌────▼─────────┐            ┌──────▼────────┐           ┌───────▼─────────┐
   │ US-001 Login  │            │ US-001 Login  │           │ US-001 Login    │
   │ US-003 Apply  │            │ US-007 View   │           │ US-011 View All │
   │ US-004 History│            │ US-008 Approve│           │ US-012 Add Emp  │
   │ US-005 Balance│            │ US-009 Reject │           │ US-013 Edit Emp │
   │ US-006 Cancel │            │ US-010 Team   │           │ US-014 Remove   │
   │ US-015 Dash   │            │ US-016 Dash   │           │ US-017 Dash     │
   └──────────────┘            └───────────────┘           └─────────────────┘
```
