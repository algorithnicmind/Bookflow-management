# Wireframes
## Leave Management System

**Version:** 1.0  
**Date:** June 2026  

---

## 1. Login Page

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│              ┌───────────────────────────┐              │
│              │                           │              │
│              │     🏢 LEAVE MANAGER      │              │
│              │                           │              │
│              │   ┌───────────────────┐   │              │
│              │   │ Email             │   │              │
│              │   │ john@company.com  │   │              │
│              │   └───────────────────┘   │              │
│              │                           │              │
│              │   ┌───────────────────┐   │              │
│              │   │ Password          │   │              │
│              │   │ ••••••••          │   │              │
│              │   └───────────────────┘   │              │
│              │                           │              │
│              │   ┌───────────────────┐   │              │
│              │   │    🔐 LOG IN      │   │              │
│              │   └───────────────────┘   │              │
│              │                           │              │
│              │   Demo: admin@demo.com    │              │
│              │   Pass: password123       │              │
│              └───────────────────────────┘              │
│                                                         │
│              ─── Dark gradient background ───           │
└─────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Centered glassmorphism card on a dark gradient background
- Animated gradient shifting subtly
- Input fields with floating labels
- Login button with hover glow effect

---

## 2. Employee Dashboard

```
┌──────────────────────────────────────────────────────────────────────┐
│  ☰  LEAVE MANAGER                              👤 John Doe  ⏏ Logout│
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  📊 Dash   │  Welcome back, John! 👋                                │
│            │                                                         │
│  ✏️ Apply  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│            │  │ 🏖 Casual │ │ 🏥 Sick  │ │ 📅 Earned│ │ 📊 Total │  │
│  📋 History│  │          │ │          │ │          │ │          │  │
│            │  │  9 / 12  │ │  9 / 10  │ │ 15 / 15 │ │  33 / 37 │  │
│  ──────    │  │ remaining│ │ remaining│ │ remaining│ │ remaining│  │
│            │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│            │                                                         │
│            │  ┌─────────────────────────────────────────────────┐    │
│            │  │ Recent Leave Requests                           │    │
│            │  ├───────┬───────┬──────────┬──────────┬──────────┤    │
│            │  │ Type  │ Dates │ Reason   │ Status   │ Action   │    │
│            │  ├───────┼───────┼──────────┼──────────┼──────────┤    │
│            │  │Casual │Jun 15 │Family    │🟡Pending │ Cancel   │    │
│            │  │       │-17    │event     │          │          │    │
│            │  ├───────┼───────┼──────────┼──────────┼──────────┤    │
│            │  │Sick   │May 10 │Doctor    │🟢Approved│   —      │    │
│            │  │       │       │visit     │          │          │    │
│            │  ├───────┼───────┼──────────┼──────────┼──────────┤    │
│            │  │Earned │Apr 20 │Vacation  │🔴Rejected│   —      │    │
│            │  │       │-25    │          │          │          │    │
│            │  └───────┴───────┴──────────┴──────────┴──────────┘    │
│            │                                                         │
│            │  ┌─────────────────────────┐                           │
│            │  │  ✏️ Apply for New Leave  │                           │
│            │  └─────────────────────────┘                           │
└────────────┴─────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Collapsible sidebar with icons and labels
- Balance cards with progress ring animations
- Color-coded status badges with subtle pulse animation
- Floating action button for quick leave application

---

## 3. Apply Leave Form

```
┌──────────────────────────────────────────────────────────────────────┐
│  ☰  LEAVE MANAGER                              👤 John Doe  ⏏ Logout│
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  📊 Dash   │  ✏️ Apply for Leave                                    │
│            │                                                         │
│  ✏️ Apply  │  ┌─────────────────────────────────────────────────┐    │
│            │  │                                                 │    │
│  📋 History│  │  Leave Type:                                    │    │
│            │  │  ┌─────────────────────────────────────┐       │    │
│            │  │  │ ▾ Casual Leave                      │       │    │
│            │  │  └─────────────────────────────────────┘       │    │
│            │  │  Available: 9 days remaining                    │    │
│            │  │                                                 │    │
│            │  │  Start Date:            End Date:               │    │
│            │  │  ┌────────────────┐    ┌────────────────┐      │    │
│            │  │  │ 📅 2026-06-15  │    │ 📅 2026-06-17  │      │    │
│            │  │  └────────────────┘    └────────────────┘      │    │
│            │  │  Duration: 3 days                               │    │
│            │  │                                                 │    │
│            │  │  Reason:                                        │    │
│            │  │  ┌─────────────────────────────────────┐       │    │
│            │  │  │ Family event celebration            │       │    │
│            │  │  │                                     │       │    │
│            │  │  └─────────────────────────────────────┘       │    │
│            │  │                                                 │    │
│            │  │  ┌───────────┐  ┌───────────┐                  │    │
│            │  │  │ ✅ Submit │  │ ❌ Cancel  │                  │    │
│            │  │  └───────────┘  └───────────┘                  │    │
│            │  │                                                 │    │
│            │  └─────────────────────────────────────────────────┘    │
└────────────┴─────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Real-time balance display when leave type is selected
- Auto-calculated duration between dates
- Inline validation messages
- Success animation on submit (checkmark)

---

## 4. Leave History

```
┌──────────────────────────────────────────────────────────────────────┐
│  ☰  LEAVE MANAGER                              👤 John Doe  ⏏ Logout│
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  📊 Dash   │  📋 Leave History                                      │
│            │                                                         │
│  ✏️ Apply  │  Filter: [All ▾] [Casual ▾] [2026 ▾]                  │
│            │                                                         │
│  📋 History│  ┌───────────────────────────────────────────────────┐  │
│            │  │ #  │ Type    │ From     │ To       │ Days │Status │  │
│            │  ├────┼─────────┼──────────┼──────────┼──────┼───────┤  │
│            │  │ 10 │ Casual  │ Jun 15   │ Jun 17   │  3   │🟡Pend │  │
│            │  │ 9  │ Sick    │ May 10   │ May 10   │  1   │🟢Appr │  │
│            │  │ 8  │ Earned  │ Apr 20   │ Apr 25   │  6   │🔴Rejd │  │
│            │  │ 7  │ Casual  │ Mar 5    │ Mar 6    │  2   │🟢Appr │  │
│            │  │ 6  │ Sick    │ Feb 14   │ Feb 14   │  1   │🟢Appr │  │
│            │  └────┴─────────┴──────────┴──────────┴──────┴───────┘  │
│            │                                                         │
│            │  Showing 5 of 8 requests          ◀ 1 2 ▶              │
└────────────┴─────────────────────────────────────────────────────────┘
```

---

## 5. Manager Dashboard — Pending Approvals

```
┌──────────────────────────────────────────────────────────────────────┐
│  ☰  LEAVE MANAGER                          👔 Alice Mgr  ⏏ Logout  │
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  📊 Dash   │  👔 Manager Dashboard                                  │
│            │                                                         │
│  ✏️ Apply  │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│            │  │ ⏳ Pending│ │ 👥 Team  │ │ 🏖 On    │               │
│  📋 History│  │          │ │          │ │  Leave   │               │
│            │  │    3     │ │    8     │ │    2     │               │
│  ──────    │  │ requests │ │ members  │ │  today   │               │
│            │  └──────────┘ └──────────┘ └──────────┘               │
│  ⏳ Pending│                                                        │
│            │  ┌─────────────────────────────────────────────────┐    │
│  👥 Team   │  │ Pending Leave Requests                  3 total │    │
│            │  ├──────────┬────────┬────────┬────────┬──────────┤    │
│            │  │ Employee │ Type   │ Dates  │ Reason │ Actions  │    │
│            │  ├──────────┼────────┼────────┼────────┼──────────┤    │
│            │  │ John Doe │ Casual │ Jun 15 │ Family │ ✅  ❌   │    │
│            │  │          │        │ -17    │ event  │          │    │
│            │  ├──────────┼────────┼────────┼────────┼──────────┤    │
│            │  │ Bob Lee  │ Sick   │ Jun 20 │ Dental │ ✅  ❌   │    │
│            │  │          │        │        │ appt   │          │    │
│            │  ├──────────┼────────┼────────┼────────┼──────────┤    │
│            │  │ Sue Park │ Earned │ Jul 1  │ Family │ ✅  ❌   │    │
│            │  │          │        │ -10    │ trip   │          │    │
│            │  └──────────┴────────┴────────┴────────┴──────────┘    │
│            │                                                         │
│            │  ┌────────────── Approve Dialog ──────────────┐        │
│            │  │ Approving leave for John Doe               │        │
│            │  │                                            │        │
│            │  │ Comments (optional):                       │        │
│            │  │ ┌──────────────────────────────────┐      │        │
│            │  │ │ Approved, enjoy!                  │      │        │
│            │  │ └──────────────────────────────────┘      │        │
│            │  │                                            │        │
│            │  │    [ ✅ Confirm ]   [ Cancel ]             │        │
│            │  └────────────────────────────────────────────┘        │
└────────────┴─────────────────────────────────────────────────────────┘
```

---

## 6. Admin Panel — Employee Management

```
┌──────────────────────────────────────────────────────────────────────┐
│  ☰  LEAVE MANAGER                         🛡️ Admin User  ⏏ Logout  │
├────────────┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  📊 Dash   │  👥 Employee Management          [+ Add Employee]      │
│            │                                                         │
│  ✏️ Apply  │  Search: ┌──────────────────────────────┐              │
│            │          │ 🔍 Search by name or email    │              │
│  📋 History│          └──────────────────────────────┘              │
│            │                                                         │
│  ──────    │  ┌──────────────────────────────────────────────────┐   │
│            │  │ Name      │ Email          │ Role    │ Dept    │Act│ │
│  ⏳ Pending│  ├───────────┼────────────────┼─────────┼─────────┼───│ │
│            │  │ John Doe  │ john@co.com    │Employee │Engineer │✏❌│ │
│  👥 Emps   │  │ Bob Lee   │ bob@co.com     │Employee │Marketing│✏❌│ │
│            │  │ Alice Mgr │ alice@co.com   │Manager  │Engineer │✏❌│ │
│  📈 Stats  │  │ Sue Park  │ sue@co.com     │Employee │Sales    │✏❌│ │
│            │  └───────────┴────────────────┴─────────┴─────────┴───┘ │
│            │                                                         │
│            │  ┌────────── Add Employee Form ──────────┐             │
│            │  │ Name:     ┌────────────────────┐      │             │
│            │  │           │                    │      │             │
│            │  │ Email:    ┌────────────────────┐      │             │
│            │  │           │                    │      │             │
│            │  │ Password: ┌────────────────────┐      │             │
│            │  │           │                    │      │             │
│            │  │ Role:     [Employee ▾]                │             │
│            │  │ Dept:     [Engineering ▾]             │             │
│            │  │ Manager:  [Alice Manager ▾]           │             │
│            │  │                                       │             │
│            │  │    [ ✅ Create ]   [ Cancel ]         │             │
│            │  └───────────────────────────────────────┘             │
└────────────┴─────────────────────────────────────────────────────────┘
```

---

## Design System Summary

| Element | Style |
|---------|-------|
| Background | Dark navy gradient (#0f0f23 → #1a1a3e) |
| Cards | Glassmorphism (rgba white bg, backdrop-blur) |
| Primary Color | Electric Indigo (#4F46E5) |
| Success | Emerald (#10B981) |
| Warning | Amber (#F59E0B) |
| Danger | Rose (#F43F5E) |
| Font | Inter (Google Fonts) |
| Border Radius | 12px (cards), 8px (inputs), 6px (badges) |
| Shadows | Multi-layer for depth |
| Animations | 0.2s ease transitions, subtle hover lifts |
