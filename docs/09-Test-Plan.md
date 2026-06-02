# Test Plan
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  
**Tester:** QA Team  

---

## 1. Test Scope

### Features Under Test
- User Authentication (Login / Logout)
- Leave Application
- Leave History & Balance
- Manager Approval / Rejection Workflow
- Admin Employee Management
- Super Admin System Governance
- Dashboard Statistics

### Test Types
- ✅ Functional Testing
- ✅ Negative Testing
- ✅ Boundary Testing
- ✅ Role-Based Access Testing
- ⬜ Performance Testing (out of scope for MVP)
- ⬜ Security Penetration Testing (out of scope for MVP)

---

## 2. Test Scenarios

### 2.1 Login Feature

| Scenario ID | Scenario | Expected Behavior |
|:-----------:|----------|-------------------|
| TS-001 | Valid employee login | Redirected to Employee Dashboard |
| TS-002 | Valid manager login | Redirected to Manager Dashboard |
| TS-003 | Valid admin login | Redirected to Admin Dashboard |
| TS-003b | Valid super admin login | Redirected to Super Admin Dashboard |
| TS-004 | Wrong password | Error: "Invalid email or password" |
| TS-005 | Non-existent email | Error: "Invalid email or password" |
| TS-006 | Empty email field | Validation error shown |
| TS-007 | Empty password field | Validation error shown |
| TS-008 | Deactivated account login | Error: "Account is deactivated" |
| TS-009 | Session persistence after page refresh | User remains logged in |
| TS-010 | Logout clears session | Redirected to login, cannot access dashboard |

### 2.2 Leave Application

| Scenario ID | Scenario | Expected Behavior |
|:-----------:|----------|-------------------|
| TS-011 | Apply casual leave with valid data | Leave created with status "Pending" |
| TS-012 | Apply sick leave | Leave created successfully |
| TS-013 | Apply earned leave | Leave created, balance deducted |
| TS-014 | Apply unpaid leave | Created (no balance check) |
| TS-015 | End date before start date | Error: "End date must be on or after start date" |
| TS-016 | Start date in the past | Error: "Start date cannot be in the past" |
| TS-017 | Overlapping dates with existing leave | Error: "Overlapping leave request" |
| TS-018 | Empty reason field | Validation error |
| TS-019 | Insufficient leave balance | Error: "Insufficient balance" |
| TS-020 | Leave balance deducted on apply | Balance decreases by number of days |

### 2.3 Leave History

| Scenario ID | Scenario | Expected Behavior |
|:-----------:|----------|-------------------|
| TS-021 | View all leave requests | All requests displayed |
| TS-022 | Filter by pending status | Only pending shown |
| TS-023 | Filter by approved status | Only approved shown |
| TS-024 | Cancel pending leave | Status → "Cancelled", balance restored |
| TS-025 | Try to cancel approved leave | Cancel button not available |

### 2.4 Manager Approval

| Scenario ID | Scenario | Expected Behavior |
|:-----------:|----------|-------------------|
| TS-026 | View pending requests from team | Only direct reports' requests shown |
| TS-027 | Approve a leave request | Status → "Approved" |
| TS-028 | Reject with reason | Status → "Rejected", balance restored |
| TS-029 | Reject without reason | Error: "Rejection reason is required" |
| TS-030 | Approve already approved leave | Error: not pending |
| TS-031 | Manager cannot see other teams' requests | Only own team visible |

### 2.5 Admin Employee Management

| Scenario ID | Scenario | Expected Behavior |
|:-----------:|----------|-------------------|
| TS-032 | View all employees | Complete employee list shown |
| TS-033 | Add new employee with valid data | Employee created with balances |
| TS-034 | Add employee with duplicate email | Error: "Email already registered" |
| TS-035 | Edit employee role | Role updated immediately |
| TS-036 | Deactivate employee | Employee marked inactive |
| TS-037 | Search employees by name | Matching results shown |

### 2.6 Dashboard

| Scenario ID | Scenario | Expected Behavior |
|:-----------:|----------|-------------------|
| TS-038 | Employee sees own stats | Correct balance and request counts |
| TS-039 | Manager sees pending count | Correct pending count badge |
| TS-040 | Admin sees org-wide stats | All departments and trends shown |

### 2.7 Authorization / Security

| Scenario ID | Scenario | Expected Behavior |
|:-----------:|----------|-------------------|
| TS-041 | Employee accesses admin API | 403 Forbidden |
| TS-042 | Employee accesses manager API | 403 Forbidden |
| TS-043 | Expired JWT token | 401 Unauthorized, redirect to login |
| TS-044 | Tampered JWT token | 403 Forbidden |
| TS-045 | Access API without token | 401 Unauthorized |

---

## 3. Test Cases (Detailed)

### Authentication Test Cases

| TC ID | Feature | Pre-condition | Input | Steps | Expected Result | Status |
|:-----:|---------|--------------|-------|-------|----------------|:------:|
| TC-001 | Login | User exists, active | email: john@company.com, password: password123 | 1. Open app 2. Enter credentials 3. Click Login | User logged in, redirected to Employee Dashboard | ⬜ |
| TC-002 | Login | User exists, active | email: john@company.com, password: wrongpass | 1. Open app 2. Enter wrong password 3. Click Login | Error message "Invalid email or password" | ⬜ |
| TC-003 | Login | N/A | email: nonexist@co.com, password: any | 1. Open app 2. Enter non-existent email 3. Click Login | Error message "Invalid email or password" | ⬜ |
| TC-004 | Login | N/A | email: (empty), password: (empty) | 1. Open app 2. Leave fields empty 3. Click Login | Validation error "Please fill in all fields" | ⬜ |
| TC-005 | Logout | User is logged in | N/A | 1. Click Logout button | Token cleared, redirected to login page | ⬜ |

### Leave Application Test Cases

| TC ID | Feature | Pre-condition | Input | Steps | Expected Result | Status |
|:-----:|---------|--------------|-------|-------|----------------|:------:|
| TC-006 | Apply Leave | Logged in as Employee, balance > 0 | type: casual, start: tomorrow, end: +2 days, reason: "Test" | 1. Open Apply Leave 2. Fill form 3. Submit | Leave created, status "Pending", balance deducted | ⬜ |
| TC-007 | Apply Leave | Logged in as Employee | type: casual, start: tomorrow, end: yesterday | 1. Fill form with invalid dates 2. Submit | Error: "End date must be on or after start date" | ⬜ |
| TC-008 | Apply Leave | Logged in as Employee | type: casual, start: past date, end: past date | 1. Fill form with past dates 2. Submit | Error: "Start date cannot be in the past" | ⬜ |
| TC-009 | Apply Leave | Logged in, 0 casual balance | type: casual, 3 days | 1. Select casual 2. Apply for 3 days | Error: "Insufficient casual leave balance" | ⬜ |
| TC-010 | Apply Leave | Existing approved leave Jun 15-17 | type: sick, start: Jun 16, end: Jun 16 | 1. Apply overlapping dates | Error: "Overlapping leave request" | ⬜ |

### Approval Workflow Test Cases

| TC ID | Feature | Pre-condition | Input | Steps | Expected Result | Status |
|:-----:|---------|--------------|-------|-------|----------------|:------:|
| TC-011 | Approve | Logged in as Manager, pending request exists | comments: "Approved" | 1. View pending 2. Click Approve 3. Add comment 4. Confirm | Status → "Approved", approval record created | ⬜ |
| TC-012 | Reject | Logged in as Manager, pending request exists | comments: "Team is short-staffed" | 1. View pending 2. Click Reject 3. Enter reason 4. Confirm | Status → "Rejected", balance restored | ⬜ |
| TC-013 | Reject | Logged in as Manager, pending request exists | comments: (empty) | 1. Click Reject 2. Leave reason empty 3. Confirm | Error: "Rejection reason is required" | ⬜ |

### Admin Test Cases

| TC ID | Feature | Pre-condition | Input | Steps | Expected Result | Status |
|:-----:|---------|--------------|-------|-------|----------------|:------:|
| TC-014 | Add Employee | Logged in as Admin | name, email, password, role, dept | 1. Click Add 2. Fill form 3. Submit | Employee created, default balances assigned | ⬜ |
| TC-015 | Add Employee | Logged in as Admin | Duplicate email | 1. Try adding existing email | Error: "Email already registered" | ⬜ |
| TC-016 | Deactivate | Logged in as Admin | Employee ID | 1. Click Delete 2. Confirm | Employee deactivated, cannot login | ⬜ |

### Super Admin Test Cases

| TC ID | Feature | Pre-condition | Input | Steps | Expected Result | Status |
|:-----:|---------|--------------|-------|-------|----------------|:------:|
| TC-017 | Super Admin Login | Super Admin account exists | email: super@company.com, password: password123 | 1. Open app 2. Enter credentials 3. Click Login | Redirected to Super Admin Dashboard | ⬜ |
| TC-018 | Create Admin | Logged in as Super Admin | name, email, password | 1. Go to Create Admin 2. Fill form 3. Submit | Admin account created successfully | ⬜ |
| TC-019 | Create Admin (dup email) | Logged in as Super Admin | Existing email | 1. Try adding existing email | Error: "Email already registered" | ⬜ |
| TC-020 | View Org Reports | Logged in as Super Admin | N/A | 1. Navigate to Reports | Organization-wide metrics displayed | ⬜ |
| TC-021 | Manage Settings | Logged in as Super Admin | System settings | 1. Go to Settings 2. Modify values 3. Save | Settings updated successfully | ⬜ |

---

## 4. Negative / Edge Case Test Cases

| TC ID | Scenario | Input | Expected Result | Status |
|:-----:|----------|-------|----------------|:------:|
| TC-N01 | Apply leave with all fields empty | (all empty) | Validation errors for all fields | ⬜ |
| TC-N02 | Apply 0-day leave (same start/end) | start = end = tomorrow | Leave created for 1 day | ⬜ |
| TC-N03 | Apply leave for 30+ days | Extremely long range | Leave created (if balance sufficient) | ⬜ |
| TC-N04 | Special characters in reason | reason: `<script>alert('xss')</script>` | Input sanitized, no script execution | ⬜ |
| TC-N05 | Very long reason (1000+ chars) | reason: 1000 char string | Accepted or truncation handled gracefully | ⬜ |
| TC-N06 | Employee tries to access /api/employees | Direct API call | 403 Forbidden | ⬜ |
| TC-N07 | Manager tries to approve own leave | Manager applies, then tries to approve | Cannot approve own leave | ⬜ |
| TC-N08 | Delete self as admin | Admin tries to deactivate own account | Error: "Cannot deactivate your own account" | ⬜ |

---

## 5. Bug Report Template

```markdown
### Bug Report

**Bug ID:** BUG-XXX  
**Title:** [Short descriptive title]  
**Reported By:** [Name]  
**Date:** [Date]  
**Severity:** [Critical / High / Medium / Low]  
**Priority:** [P0 / P1 / P2 / P3]  
**Status:** [Open / In Progress / Fixed / Closed / Won't Fix]

**Environment:**
- Browser: Chrome 126
- OS: Windows 11
- Server: Node.js 18

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**  
[What should happen]

**Actual Result:**  
[What actually happened]

**Screenshots/Logs:**  
[Attach if applicable]

**Additional Notes:**  
[Any relevant context]
```

### Sample Bug Report

**Bug ID:** BUG-001  
**Title:** Manager approval not updating leave status  
**Reported By:** QA Tester  
**Date:** 2026-06-05  
**Severity:** High  
**Priority:** P0  
**Status:** Open

**Steps to Reproduce:**
1. Login as Manager (alice@company.com)
2. Navigate to Pending Requests
3. Click "Approve" on John Doe's leave request
4. Add comment "Approved"
5. Click Confirm

**Expected Result:**  
Leave status changes to "Approved" in both manager and employee views

**Actual Result:**  
Status remains "Pending" in the employee's leave history view

---

## 6. Final Test Report Template

```markdown
### Final Test Report

**Project:** Leave Management System  
**Version:** 1.0  
**Date:** [Date]  
**Tester:** [Name]

#### Summary

| Metric | Count |
|--------|:-----:|
| Total Test Cases | XX |
| Passed | XX |
| Failed | XX |
| Blocked | XX |
| Not Executed | XX |
| **Pass Rate** | **XX%** |

#### Bugs Summary

| Metric | Count |
|--------|:-----:|
| Total Bugs Found | XX |
| Critical | XX |
| High | XX |
| Medium | XX |
| Low | XX |
| Bugs Fixed | XX |
| Bugs Pending | XX |

#### Feature-wise Results

| Feature | Total | Passed | Failed | Pass Rate |
|---------|:-----:|:------:|:------:|:---------:|
| Authentication | X | X | X | X% |
| Leave Application | X | X | X | X% |
| Leave History | X | X | X | X% |
| Manager Approval | X | X | X | X% |
| Admin Management | X | X | X | X% |
| Super Admin | X | X | X | X% |
| Dashboard | X | X | X | X% |
| Security / Access | X | X | X | X% |

#### Recommendation

[Release / Conditional Release / Not Ready for Release]

#### Notes

[Any observations, known issues, or recommendations for future testing cycles]
```
