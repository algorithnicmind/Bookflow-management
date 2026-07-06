# Sprint Tracker & Daily Standups

## Leave Management System

**Version:** 1.0  
**Date:** June 2026  
**Sprint Duration:** 6 Days  

---

## 1. Sprint Overview

| Attribute | Detail |
| ----------- | -------- |
| **Sprint Goal** | Build and deliver a fully functional Leave Management System with role-based access, leave workflow, and analytics dashboard |
| **Team Size** | Product Manager, Developer, Tester |
| **Sprint Start** | Day 1 |
| **Sprint End** | Day 6 (Demo Day) |
| **Total Story Points** | 45 |

---

## 2. Sprint Backlog

| Priority | Task | Owner | Story Points | Status |
| :--------: | ------ | ------- | :------------: | :------: |
| 🔴 P0 | Requirement Gathering & PRD | PM | 5 | ✅ Done |
| 🔴 P0 | User Stories & Acceptance Criteria | PM | 3 | ✅ Done |
| 🔴 P0 | User Flow Diagrams | PM | 3 | ✅ Done |
| 🔴 P0 | HLD & Architecture Design | Dev | 5 | ✅ Done |
| 🔴 P0 | LLD & Database Schema | Dev | 5 | ✅ Done |
| 🔴 P0 | API Documentation | Dev | 3 | ✅ Done |
| 🔴 P0 | UI Wireframes | Dev | 3 | ✅ Done |
| 🔴 P0 | Authentication (Login/Logout) | Dev | 5 | ✅ Done |
| 🔴 P0 | B2B Enterprise Onboarding Flow | Dev | 5 | ✅ Done |
| 🔴 P0 | Leave Application Feature | Dev | 5 | ✅ Done |
| 🔴 P0 | Leave History & Balance | Dev | 3 | ✅ Done |
| 🔴 P0 | Manager Approval Workflow | Dev | 5 | ✅ Done |
| 🟡 P1 | Admin Employee & Settings Mgmt | Dev | 5 | ✅ Done |
| 🟡 P1 | Dashboard & Analytics | Dev | 5 | ✅ Done |
| 🟡 P1 | AI Chatbot Integration | Dev | 3 | ✅ Done |
| 🔴 P0 | Test Plan & Test Cases | Tester | 3 | ✅ Done |
| 🔴 P0 | Functional Testing Execution | Tester | 5 | ⬜ To Do |
| 🟡 P1 | Negative & Edge Case Testing | Tester | 3 | ⬜ To Do |
| 🟡 P1 | Bug Reporting & Tracking | Tester | 2 | ⬜ To Do |
| 🔴 P0 | Product Demo Preparation | PM | 3 | ⬜ To Do |

---

## 3. Daily Standup Logs

### Format

Each standup answers three questions:

1. **What was completed yesterday?**
2. **What will be done today?**
3. **Any blockers?**

---

### 📅 Day 1 — Requirement Gathering

| Team Member | Yesterday | Today | Blockers |
| ------------- | ----------- | ------- | ---------- |
| **PM** | — (Sprint Start) | Gather requirements, write Problem Statement, define Scope, identify User Roles | None |
| **Dev** | — (Sprint Start) | Review requirements with PM, begin HLD planning | Waiting for finalized requirements |
| **Tester** | — (Sprint Start) | Read and understand requirements, begin test scenario brainstorming | None |

**Day 1 Outcomes:**

- [ ] Problem Statement drafted
- [ ] Scope Document (In/Out) defined
- [ ] User Roles & Permissions identified
- [ ] PRD document created

---

### 📅 Day 2 — User Stories & Design

| Team Member | Yesterday | Today | Blockers |
| ------------- | ----------- | ------- | ---------- |
| **PM** | Completed PRD with Problem Statement, Scope, User Roles | Write User Stories with acceptance criteria, prioritize backlog | None |
| **Dev** | Reviewed requirements | Create HLD (architecture diagram, module breakdown), begin LLD (DB schema, ER diagram) | None |
| **Tester** | Studied requirements | Create Test Scenarios and start writing Test Cases | Need User Stories for complete test case mapping |

**Day 2 Outcomes:**

- [ ] User Stories (US-001 to US-020) written
- [ ] User Flow Diagrams created
- [ ] HLD document completed
- [ ] Test Scenarios drafted

---

### 📅 Day 3 — Technical Design & API Planning

| Team Member | Yesterday | Today | Blockers |
| ------------- | ----------- | ------- | ---------- |
| **PM** | Completed User Stories and Flows | Review HLD/LLD with Dev, create wireframes or review Dev's wireframes | None |
| **Dev** | Completed HLD | Finalize LLD (SQL schema), design all APIs, create wireframes | None |
| **Tester** | Drafted test scenarios | Complete detailed Test Cases, write Negative Test Cases | None |

**Day 3 Outcomes:**

- [x] LLD document completed (DB schema + SQL DDL)
- [x] API Documentation finalized (all endpoints)
- [x] UI Wireframes created
- [ ] Test Cases finalized (TC-001 to TC-021)

---

### 📅 Day 4 — Development Sprint (Part 1)

| Team Member | Yesterday | Today | Blockers |
| ------------- | ----------- | ------- | ---------- |
| **PM** | Reviewed all design documents | Track progress, resolve any requirement ambiguities, begin demo prep | None |
| **Dev** | Completed all design docs | Build: Authentication (Login/Logout), Apply Leave, Leave History | Database setup needed |
| **Tester** | Completed test plan | Review dev progress, prepare test environment, begin smoke testing | Waiting for first build |

**Day 4 Outcomes:**

- [x] Login/OAuth functional
- [x] B2B Onboarding Form (Lead capture) working
- [x] Apply Leave form working
- [x] Leave History page displaying data
- [x] Database seeded with demo tenant data

---

### 📅 Day 5 — Development Sprint (Part 2)

| Team Member | Yesterday | Today | Blockers |
| ------------- | ----------- | ------- | ---------- |
| **PM** | Tracked progress, resolved blockers | Continue tracking, finalize demo script, rehearse presentation | None |
| **Dev** | Built Auth + Leave features | Build: Manager Approval, Admin Panel, Dashboard statistics | None |
| **Tester** | Prepared test environment | Execute functional tests, negative tests, report bugs | Need stable build for full testing |

**Day 5 Outcomes:**

- [x] Manager approval/rejection working
- [x] Admin employee CRUD functional
- [x] Dashboard showing real statistics
- [x] AI Chatbot integration working
- [ ] First round of testing completed
- [ ] Bug reports filed (if any)

---

### 📅 Day 6 — Demo Day

| Team Member | Yesterday | Today | Blockers |
| ------------- | ----------- | ------- | ---------- |
| **PM** | Finalized demo script | Present Product Demo: Problem, Features, User Journey, Future Improvements | None |
| **Dev** | Completed all features | Fix critical bugs, prepare deployment guide, support demo | Bug fixes if any |
| **Tester** | Executed full test suite | Finalize Test Report, present testing findings during demo | None |

**Day 6 Outcomes:**

- [ ] All critical bugs resolved
- [ ] Product Demo presented
- [ ] Final Test Report submitted
- [ ] Deployment Guide reviewed

---

## 4. Burndown Tracking

```text
Story Points Remaining
45 |████████████████████████████████████████████████
40 |██████████████████████████████████████████
35 |████████████████████████████████████
30 |██████████████████████████████
25 |████████████████████████
20 |██████████████████
15 |████████████
10 |██████
 5 |███
 0 |
   +------------------------------------------
     Day 1   Day 2   Day 3   Day 4   Day 5   Day 6
```

*Update daily as tasks are completed.*

---

## 5. Blockers & Risk Log

| # | Blocker / Risk | Raised By | Date | Impact | Resolution | Status |
| :-: | ---------------- | ----------- | ------ | -------- | ------------ | :------: |
| 1 | Database setup environment issues | Dev | — | High — blocks all development | Use local PostgreSQL or Docker | ⬜ Open |
| 2 | Unclear requirement for leave balance carry-forward | PM | — | Medium — affects earned leave logic | Clarified: max 5 days carry-forward | ⬜ Open |
| 3 | — | — | — | — | — | ⬜ Open |

---

## 6. Sprint Retrospective (Post Day 6)

### What went well?

- [ ] *To be filled after sprint completion*

### What could be improved?

- [ ] *To be filled after sprint completion*

### Action items for next sprint

- [ ] *To be filled after sprint completion*
