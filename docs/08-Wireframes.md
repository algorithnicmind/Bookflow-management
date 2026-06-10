# Enterprise Design System & UI/UX Specification
## Leave Management System

**Version:** 2.0 (Enterprise Overhaul)  
**Date:** June 2026  

---

## 1. Design Philosophy

The LeaveFlow interface is designed to be **premium, frictionless, and highly responsive**. It moves away from flat, static interfaces towards a deeply immersive **"Glass & Light"** aesthetic, prioritizing dark mode as the primary canvas to make primary actions and data visualizations pop.

### Key Pillars:
1. **Depth & Glassmorphism:** Utilization of multi-layered blurred backgrounds, soft inner glows, and floating elements to establish visual hierarchy without heavy borders.
2. **Micro-interactions:** Every hover, click, and state change provides immediate, physics-based visual feedback (via Framer Motion spring animations).
3. **Cognitive Ease:** Complex data (like leave balances and team schedules) is reduced to skimmable, beautifully styled "Bento Box" grid components.
4. **Vibrant Accents:** A subdued, deep background palette contrasted with highly saturated, neon-adjacent gradients for primary interactions.

---

## 2. Global Tokens & Typography

### Typography
- **Primary Font:** `Inter` (Sans-serif) - chosen for legibility in dense data grids.
- **Heading Weight:** 700 (Bold) to 800 (Extrabold) with tight tracking (`tracking-tight`).
- **Body Weight:** 400 (Regular) to 500 (Medium).
- **Tabular Data:** Ensure all numerical data uses `tabular-nums` for alignment in tables and widgets.

### Color Palette (Dark Theme Default)
- **Background Deep:** `#0b0c16` (Primary app background)
- **Background Surface:** `#111326` (Secondary areas, sidebar)
- **Background Elevated:** `#161832` (Cards, dropdowns)
- **Primary Action (Brand):** Electric Indigo `#4F46E5`
- **Primary Hover/Active:** Deep Indigo `#4338CA`
- **Accent Gradient:** Linear from Indigo (`#4F46E5`) to Purple (`#7C3AED`) to Pink (`#EC4899`)
- **Semantic Success:** Emerald `#10B981` (Approved leaves)
- **Semantic Warning:** Amber `#F59E0B` (Pending leaves)
- **Semantic Danger:** Rose `#F43F5E` (Rejected leaves)

### Glass System
Elements that float above the background use the `glass-card` class:
- `background: rgba(255, 255, 255, 0.04)`
- `backdrop-filter: blur(20px)`
- `border: 1px solid rgba(255, 255, 255, 0.08)`
- `box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.3)`

---

## 3. Core Component Specifications

### 3.1 Layout Shell (Sidebar & Topbar)
- **Sidebar:** Collapsible (`260px` expanded, `72px` collapsed). Uses `.bg-secondary` with a subtle right border. Navigation links feature a staggered fade-in animation on load. Active states feature a left-aligned vertical glowing bar (`var(--primary)`).
- **Topbar:** Sticky, `glass-bg` with backdrop blur. Contains the global search/Command Palette (`Cmd+K`), user profile dropdown, and notification bell (which pulses gently when unread notifications exist).

### 3.2 Buttons
- **Primary Button (`.btn-primary`):** Features a subtle background gradient. On hover, a glowing shadow (`box-shadow: 0 0 20px var(--primary-glow)`) activates, and the button translates up slightly (`-translate-y-[1px]`). A diagonal sheen effect sweeps across the button on hover.
- **Ghost Button (`.btn-ghost`):** Transparent background, outline border. On hover, fills with a very faint white opacity (`rgba(255,255,255,0.08)`).

### 3.3 Dashboard (Bento Box Grid)
The employee and manager dashboards use a modern CSS Grid layout (Bento Box).
- **Widgets:** Each metric (Leave Balance, Pending Requests) sits in a `glass-card`.
- **Loading State:** Skeleton loaders with a shimmering gradient (`animate-shimmer`) are displayed while data fetches.
- **Charts:** Recharts are used with customized `Tooltip` components (styled as glass cards) and `Area` paths filled with `url(#colorGradient)` rather than flat colors.

### 3.4 Data Tables
- **Styling:** Headings are uppercase, tracking wide, text muted. Rows have a very faint hover effect (`hover:bg-white/[0.02]`).
- **Status Badges:** Use semantic colors with low-opacity backgrounds and solid text/borders (e.g., Success is `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`). They include a subtle, continuous pulse animation to draw attention to pending items.

### 3.5 Forms & Inputs
- **Inputs (`.input-field`):** Dark semi-transparent background (`rgba(0,0,0,0.15)`). On focus, border turns to `var(--primary)` and an outer ring glow appears. Labels use floating animations or sit clearly above the input with muted, uppercase styling.
- **Validation:** Inline red text (`var(--danger)`) with a slight shake animation on failed submission.

---

## 4. UX Flows & Interactions

### The Application Flow
1. **Login Experience:** The user lands on a screen with a deep, animated radial gradient background. The login card is a prominent glass element. Submitting the form triggers a spinner inside the button, avoiding full-page reloads until authentication completes.
2. **Dashboard Entry:** Upon successful login, the dashboard elements load via a **Staggered Fade-in Animation**. The sidebar slides in from the left, while the Bento widgets drift up (`translateY(12px)` to `0`) and fade in sequence (`0.05s` delay increments).
3. **Applying for Leave:** Clicking "Apply" opens a **Sheet (Side drawer)** or a **Glass Modal**, rather than navigating to a separate hard page. This keeps the user in the context of their dashboard. Selecting a "Leave Type" instantly calculates and animates the "Remaining Balance" counter using a spinning number effect.
4. **Notifications:** Toast notifications (`sonner`) appear in the bottom-right for transient success/error messages, floating above all content.

### Micro-Animations Blueprint
- `fadeIn`: General entry for static components (`opacity 0 -> 1`, `Y 12px -> 0`).
- `slideInLeft`: Sidebar and menu flyouts.
- `pulse-glow`: Used on primary CTAs or pending status badges to draw the eye softly.
- `dropdown-enter`: Scale `0.95` to `1` with opacity fade, giving dropdowns a snappy, lightweight feel.

---

## 5. Accessibility (A11y)
- **Contrast:** Despite the dark mode, text contrast ratios must exceed WCAG AA standards. Muted text should not fall below `#64748B`.
- **Focus Rings:** Keyboard navigation must be fully supported. Focus rings use the `outline-ring` utility with a noticeable offset.
- **Motion Reduction:** Respect `prefers-reduced-motion` media queries by disabling complex spring animations and falling back to basic opacity crossfades.

---

## 6. Structural Wireframes (Enterprise Layout)

### 6.1 Login Screen
```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                  [Animated Radial Glow]                    │
│                                                            │
│        ╔══════════════════════════════════════════╗        │
│        ║                                          ║        │
│        ║  [L] LeaveFlow                           ║        │
│        ║                                          ║        │
│        ║  Welcome back                            ║        │
│        ║  Please enter your details to sign in.   ║        │
│        ║                                          ║        │
│        ║  EMAIL ADDRESS                           ║        │
│        ║  ╭────────────────────────────────────╮  ║        │
│        ║  │ ✉️ you@company.com                 │  ║        │
│        ║  ╰────────────────────────────────────╯  ║        │
│        ║                                          ║        │
│        ║  PASSWORD                 Forgot Pass?   ║        │
│        ║  ╭────────────────────────────────────╮  ║        │
│        ║  │ 🔒 ••••••••                      👁 │  ║        │
│        ║  ╰────────────────────────────────────╯  ║        │
│        ║                                          ║        │
│        ║  [     ✨ SIGN IN (btn-primary)     ]  ║        │
│        ║                                          ║        │
│        ║  Demo Credentials                        ║        │
│        ║  Admin | manager@... | employee@...      ║        │
│        ╚══════════════════════════════════════════╝        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 6.2 Bento Box Analytics Dashboard
```text
┌──────────────────────────────────────────────────────────────────┐
│ [L] LeaveFlow  | Search (⌘K)              🌙  🔔(2)  👤 Admin    │
├──────────────┬───────────────────────────────────────────────────┤
│ Menu         │                                                   │
│ ├ Dashboard  │  Organization Analytics         [Time Range ▾]    │
│ ├ Apply Leave│                                                   │
│ ├ History    │  ╔════════════╗ ╔════════════╗ ╔════════════╗     │
│              │  ║ 👥 Total   ║ ║ 📋 Reqs    ║ ║ ⏳ Pending ║     │
│ Admin        │  ║ 150        ║ ║ 320        ║ ║ 12         ║     │
│ ├ Employees  │  ╚════════════╝ ╚════════════╝ ╚════════════╝     │
│ ├ Analytics  │                                                   │
│              │  ╔═════════════════════════╗ ╔═════════════════╗  │
│ System       │  ║  Department Breakdown   ║ ║ Leave Status    ║  │
│ ├ Settings   │  ║       [Pie Chart]       ║ ║   [Bar Chart]   ║  │
│ ├ Help       │  ║                         ║ ║                 ║  │
│              │  ╚═════════════════════════╝ ╚═════════════════╝  │
│              │                                                   │
│ ≪ Collapse   │  ╔═════════════════════════════════════════════╗  │
│              │  ║  Monthly Leave Trend                        ║  │
│              │  ║          [Area Chart w/ Gradient]           ║  │
│              │  ╚═════════════════════════════════════════════╝  │
└──────────────┴───────────────────────────────────────────────────┘
```

### 6.3 Apply Leave (Modal / Side Sheet)
```text
┌────────────────────────────────────────────────────────────┐
│  Apply for Leave                                       [X] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  LEAVE TYPE                                                │
│  ╭──────────────────────────────────────────────────────╮  │
│  │ ▾ Casual Leave                       [9 Days Left]   │  │
│  ╰──────────────────────────────────────────────────────╯  │
│                                                            │
│  START DATE                     END DATE                   │
│  ╭─────────────────────╮        ╭─────────────────────╮    │
│  │ 📅 Jun 15, 2026     │   →    │ 📅 Jun 17, 2026     │    │
│  ╰─────────────────────╯        ╰─────────────────────╯    │
│  Duration: 3 Days                                          │
│                                                            │
│  REASON                                                    │
│  ╭──────────────────────────────────────────────────────╮  │
│  │ Type your reason here...                             │  │
│  │                                                      │  │
│  ╰──────────────────────────────────────────────────────╯  │
│                                                            │
│  [ Cancel ]                        [ ✨ Submit Request ]   │
└────────────────────────────────────────────────────────────┘
```

---
*This document supersedes the v1.0 ASCII wireframes and serves as the source of truth for the Enterprise UI/UX implementation.*