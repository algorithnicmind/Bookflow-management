# Enterprise Design System & UI/UX Specification
## Leave Management System

**Version:** 2.0  
**Date:** June 2026  
**Framework:** Next.js (React) + CSS Custom Properties  
**Design Language:** Dark Glassmorphism

---

## 1. Design System Overview

### 1.1 Color Palette

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COLOR TOKENS (CSS Custom Properties)            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  BACKGROUND TOKENS                                                  │
│  ┌──────────┬──────────────┬──────────────────────────────────┐    │
│  │ Token    │ Value        │ Usage                            │    │
│  ├──────────┼──────────────┼──────────────────────────────────┤    │
│  │ --bg-1   │ #0a0b14      │ Page background (deepest)        │    │
│  │ --bg-2   │ #0f1123      │ Sidebar / secondary panels       │    │
│  │ --bg-3   │ #16183a      │ Elevated surfaces / cards        │    │
│  │ --bg-glass│ rgba(22,24,58,0.85) │ Glassmorphism cards      │    │
│  └──────────┴──────────────┴──────────────────────────────────┘    │
│                                                                     │
│  TEXT TOKENS                                                        │
│  ┌──────────┬──────────────┬──────────────────────────────────┐    │
│  │ Token    │ Value        │ Usage                            │    │
│  ├──────────┼──────────────┼──────────────────────────────────┤    │
│  │ --text-1 │ #e8ecf4      │ Primary text (headings, body)    │    │
│  │ --text-2 │ #7c82a8      │ Secondary text (labels, muted)   │    │
│  │ --text-3 │ #4a5078      │ Disabled / placeholder text      │    │
│  └──────────┴──────────────┴──────────────────────────────────┘    │
│                                                                     │
│  SEMANTIC TOKENS                                                    │
│  ┌──────────┬──────────────┬──────────────────────────────────┐    │
│  │ Token    │ Value        │ Usage                            │    │
│  ├──────────┼──────────────┼──────────────────────────────────┤    │
│  │ --accent │ #4f46e5      │ Primary CTA, active states       │    │
│  │ --success│ #10b981      │ Approved, success, positive      │    │
│  │ --warning│ #f59e0b      │ Pending, caution, in-progress    │    │
│  │ --danger │ #f43f5e      │ Rejected, error, destructive     │    │
│  │ --info   │ #3b82f6      │ Informational, neutral highlights│    │
│  └──────────┴──────────────┴──────────────────────────────────┘    │
│                                                                     │
│  BORDER TOKENS                                                      │
│  ┌──────────┬──────────────────────┬──────────────────────────┐    │
│  │ Token    │ Value                │ Usage                    │    │
│  ├──────────┼──────────────────────┼──────────────────────────┤    │
│  │ --border │ rgba(255,255,255,0.05)│ Default dividers        │    │
│  │ --b-hover│ rgba(255,255,255,0.1) │ Hover state borders     │    │
│  └──────────┴──────────────────────┴──────────────────────────┘    │
│                                                                     │
│  GRADIENT PALETTE                                                   │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Primary:   linear-gradient(135deg, #4f46e5, #4338ca)      │    │
│  │ Secondary: linear-gradient(135deg, #4f46e5, #7c3aed)      │    │
│  │ Success:   linear-gradient(135deg, #10b981, #059669)      │    │
│  │ Danger:    linear-gradient(135deg, #f43f5e, #e11d48)      │    │
│  │ Accent:    linear-gradient(135deg, #4f46e5, #7c3aed)      │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Typography Scale

```
┌─────────────────────────────────────────────────────────────────────┐
│                       TYPOGRAPHY SYSTEM                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI',       │
│               Roboto, 'Helvetica Neue', Arial, sans-serif          │
│                                                                     │
│  ┌────────────────┬────────┬────────┬────────┬──────────────────┐  │
│  │ Role           │ Size   │ Weight │ Letter │ Line Height       │  │
│  ├────────────────┼────────┼────────┼────────┼──────────────────┤  │
│  │ Page Title     │ 1.6rem │ 700    │ -0.5px │ 1.2              │  │
│  │ Hero Heading   │ clamp │ 800    │ tight  │ 1.1              │  │
│  │                │(2.2rem │        │        │                  │  │
│  │                │ 3.8rem)│        │        │                  │  │
│  │ Card Heading   │ 1rem   │ 700    │ normal │ 1.3              │  │
│  │ Stat Value     │ 2rem   │ 800    │ -1px   │ 1.0              │  │
│  │ Body / P       │ 0.9rem │ 400    │ normal │ 1.6              │  │
│  │ Body Small     │ 0.85rem│ 400    │ normal │ 1.5              │  │
│  │ Label          │ 0.8rem │ 500    │ 0.5px  │ 1.0              │  │
│  │ Micro / Tag    │ 0.78rem│ 500-600│ 0.5px  │ 1.0              │  │
│  │ Badge          │ 0.75rem│ 600    │ normal │ 1.0              │  │
│  │ Tiny / Dim     │ 0.7rem │ 500    │ normal │ 1.0              │  │
│  └────────────────┴────────┴────────┴────────┴──────────────────┘  │
│                                                                     │
│  Text Transform:                                                    │
│    - Labels: UPPERCASE (0.5px letter-spacing)                      │
│    - Badges: capitalize                                             │
│    - Roles:  capitalize (with _ → space)                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Spacing & Layout Tokens

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SPACING & LAYOUT                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  BORDER RADIUS                                                      │
│  ┌──────────┬──────────────────────────────────────────────────┐   │
│  │ --r-sm   │ 6px   → buttons, inputs, small elements         │   │
│  │ --r-md   │ 10px  → cards, modals, panels                    │   │
│  │ --r-lg   │ 16px  → large containers                         │   │
│  │ Pill     │ 100px → badges, filter chips, avatar             │   │
│  └──────────┴──────────────────────────────────────────────────┘   │
│                                                                     │
│  BOX SHADOWS                                                        │
│  ┌──────────┬──────────────────────────────────────────────────┐   │
│  │ --sh-sm  │ 0 1px 3px rgba(0,0,0,0.3)     → subtle lift    │   │
│  │ --sh-md  │ 0 4px 16px rgba(0,0,0,0.3)    → card hover     │   │
│  │ --sh-lg  │ 0 8px 32px rgba(0,0,0,0.4)    → modals, popups │   │
│  └──────────┴──────────────────────────────────────────────────┘   │
│                                                                     │
│  TRANSITIONS                                                        │
│  ┌──────────┬──────────────────────────────────────────────────┐   │
│  │ Default  │ all 0.25s cubic-bezier(0.4, 0, 0.2, 1)          │   │
│  │ Fast     │ all 0.2s cubic-bezier(0.4, 0, 0.2, 1)           │   │
│  └──────────┴──────────────────────────────────────────────────┘   │
│                                                                     │
│  PAGE CONTAINER                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Padding:    28px 32px                                        │  │
│  │ Max Width:  1400px                                           │  │
│  │ Margin:     0 auto                                           │  │
│  │ Header MB:  28px                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  GRID SYSTEM                                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ .grid-2 → 2 columns, 20px gap                               │  │
│  │ .grid-3 → 3 columns, 20px gap                               │  │
│  │ .grid-4 → 4 columns, 20px gap                               │  │
│  │ Responsive: 1200px → 2col, 900px → 2col, 700px → 1col       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  LAYOUT DIMENSIONS                                                  │
│  ┌──────────┬──────────────────────────────────────────────────┐   │
│  │ Sidebar  │ 260px fixed width                                │   │
│  │ Header   │ 64px fixed height                                │   │
│  └──────────┴──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. UI Component Library

### 2.1 Component: Button

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUTTON COMPONENT                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Variants:                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  [PRIMARY]   ┌────────────────────────┐                     │   │
│  │              │  gradient #4f46e5→#4338ca │  White text       │   │
│  │              └────────────────────────┘  No border          │   │
│  │                                                             │   │
│  │  [SECONDARY] ┌────────────────────────┐                     │   │
│  │              │  transparent bg         │  1px border        │   │
│  │              └────────────────────────┘  text-main color    │   │
│  │                                                             │   │
│  │  [SUCCESS]   ┌────────────────────────┐                     │   │
│  │              │  gradient #10b981→#059669 │  White text       │   │
│  │              └────────────────────────┘  No border          │   │
│  │                                                             │   │
│  │  [DANGER]    ┌────────────────────────┐                     │   │
│  │              │  gradient #f43f5e→#e11d48 │  White text       │   │
│  │              └────────────────────────┘  No border          │   │
│  │                                                             │   │
│  │  [GHOST]     ┌────────────────────────┐                     │   │
│  │              │  transparent bg         │  No border         │   │
│  │              └────────────────────────┘  text-muted color   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Sizes:                                                             │
│  ┌──────┬──────────────────┬──────────────────────────────────┐    │
│  │ sm   │ 6px 12px padding │ 0.78rem font                     │    │
│  │ md   │ 10px 20px padding│ 0.85rem font                     │    │
│  │ lg   │ 14px 28px padding│ 0.95rem font                     │    │
│  └──────┴──────────────────┴──────────────────────────────────┘    │
│                                                                     │
│  States:                                                            │
│  ┌──────────┬──────────────────────────────────────────────────┐   │
│  │ Default  │ Full opacity, default bg                         │   │
│  │ Hover    │ Opacity 0.9 (gradient) / border-color accent     │   │
│  │ Loading  │ Spinner + "Signing in..." text, opacity 0.7      │   │
│  │ Disabled │ Opacity 0.6, cursor: not-allowed                  │   │
│  └──────────┴──────────────────────────────────────────────────┘   │
│                                                                     │
│  Properties: variant, size, fullWidth, loading, disabled, onClick   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component: Card (Glass)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CARD COMPONENT                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ Glass Card ──────────────────────────────────────────────┐     │
│  │                                                            │     │
│  │  background:  rgba(22, 24, 58, 0.85)                      │     │
│  │  backdrop-filter: blur(16px)                               │     │
│  │  border: 1px solid rgba(255,255,255,0.05)                  │     │
│  │  border-radius: 10px                                       │     │
│  │  padding: 20px                                             │     │
│  │                                                            │     │
│  │  Hover State (.glass-hover):                               │     │
│  │    border-color → rgba(255,255,255,0.1)                    │     │
│  │    box-shadow → 0 4px 20px rgba(79,70,229,0.1)            │     │
│  │                                                            │     │
│  │  ┌─────────────────────────────────────────────────────┐  │     │
│  │  │  Card Content Area                                   │  │     │
│  │  │  (heading, tables, forms, etc.)                      │  │     │
│  │  └─────────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  Usage: Dashboard tables, form containers, stat panels              │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Component: StatCard

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STATCARD COMPONENT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────┐                               │
│  │  TOTAL REQUESTS           📋    │  ← label (uppercase, 0.78rem) │
│  │                                 │                                │
│  │  42                             │  ← value (2rem, 800, colored)  │
│  │                                 │                                │
│  │  3 requests pending             │  ← subtitle (optional, 0.78rem)│
│  │  ↑ 12%                          │  ← trend (optional, +/-%)     │
│  └─────────────────────────────────┘                               │
│                                                                     │
│  Props: label, value, icon, color, subtitle, trend, isLoading      │
│  Loading: Skeleton animation with pulse keyframes                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.4 Component: Badge

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BADGE COMPONENT                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Status Colors:                                                     │
│  ┌──────────┬───────────┬──────────┬──────────┐                    │
│  │ Status   │ Background│ Text     │ Dot      │                    │
│  ├──────────┼───────────┼──────────┼──────────┤                    │
│  │ pending  │ rgba(245,  │ #f59e0b  │ #f59e0b  │                    │
│  │          │ 158,11,.12)│          │          │                    │
│  ├──────────┼───────────┼──────────┼──────────┤                    │
│  │ approved │ rgba(16,  │ #10b981  │ #10b981  │                    │
│  │          │ 185,129,.12)│         │          │                    │
│  ├──────────┼───────────┼──────────┼──────────┤                    │
│  │ rejected │ rgba(244, │ #f43f5e  │ #f43f5e  │                    │
│  │          │ 63,94,.12)│          │          │                    │
│  ├──────────┼───────────┼──────────┼──────────┤                    │
│  │ cancelled│ rgba(124, │ #7c82a8  │ #7c82a8  │                    │
│  │          │ 130,168,.12)│         │          │                    │
│  └──────────┴───────────┴──────────┴──────────┘                    │
│                                                                     │
│  Shape: Pill (border-radius: 100px)                                 │
│  Layout: ● dot + text (capitalize)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.5 Component: Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MODAL COMPONENT                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Overlay ────────────────────────────────────────────────┐     │
│  │  background: rgba(0,0,0,0.6)                              │     │
│  │  backdrop-filter: blur(4px)                                │     │
│  │  animation: fadeIn 0.2s                                    │     │
│  │                                                            │     │
│  │  ┌── Modal Panel ─────────────────────────────────────┐   │     │
│  │  │  Glass card style (backdrop-filter: blur)           │   │     │
│  │  │  max-width: 480px                                   │   │     │
│  │  │  max-height: 90vh                                   │   │     │
│  │  │  animation: scaleIn 0.25s                           │   │     │
│  │  │                                                      │   │     │
│  │  │  ┌─ Header ──────────────────────────────────────┐  │   │     │
│  │  │  │  Title (left)              [✕ close button]   │  │   │     │
│  │  │  └───────────────────────────────────────────────┘  │   │     │
│  │  │  ┌─ Body ────────────────────────────────────────┐  │   │     │
│  │  │  │                                                │  │   │     │
│  │  │  │  Content area (24px padding)                   │  │   │     │
│  │  │  │                                                │  │   │     │
│  │  │  └───────────────────────────────────────────────┘  │   │     │
│  │  └──────────────────────────────────────────────────────┘   │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  Close triggers: ✕ button, Escape key, overlay click                │
│  Body scroll: locked when open                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Page Wireframes & Layouts

### 3.1 Landing Page (/)

```
┌─────────────────────────────────────────────────────────────────────┐
│  LANDING PAGE — /                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Header ───────────────────────────────────────────────────┐   │
│  │  [L] LeaveFlow                          [Sign In]           │   │
│  │  logo (gradient)          btn-primary gradient              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Hero Section ─────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │           ✨ Enterprise Leave Management                    │   │
│  │           (pill badge with accent glow)                     │   │
│  │                                                             │   │
│  │     Streamline Your                                        │   │
│  │     Leave Management                                        │   │
│  │     (gradient text: #4f46e5 → #7c3aed)                     │   │
│  │                                                             │   │
│  │     A powerful, enterprise-grade platform for               │   │
│  │     managing employee leave requests...                     │   │
│  │                                                             │   │
│  │     [ Get Started → ]     [ Learn More ]                    │   │
│  │     btn-primary            btn-secondary                    │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Feature Cards (grid 4) ───────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │   │
│  │  │  🎯     │  │  ⚡     │  │  📊     │  │  🔒     │      │   │
│  │  │  Easy   │  │  Fast   │  │  Smart  │  │  Secure │      │   │
│  │  │  Apply  │  │Approvals│  │Dashboard│  │& Private│      │   │
│  │  │  Submit │  │Managers │  │Role-    │  │Enterprise│     │   │
│  │  │  leave  │  │review   │  │based    │  │grade    │      │   │
│  │  │  in sec │  │with one │  │dashbrd  │  │security │      │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Background: Animated background beams effect (BackgroundBeams)     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Login Page (/login)

```
┌─────────────────────────────────────────────────────────────────────┐
│  LOGIN PAGE — /login                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │                    ┌─────────┐                              │   │
│  │                    │    L    │  Logo (48x48, gradient)      │   │
│  │                    └─────────┘                              │   │
│  │               Welcome back                                  │   │
│  │          Sign in to your LeaveFlow account                  │   │
│  │                                                             │   │
│  │  ┌── Glass Card (form) ───────────────────────────────┐    │   │
│  │  │                                                     │    │   │
│  │  │  ┌── Error Banner (conditional) ───────────────┐   │    │   │
│  │  │  │  ⚠ Error message text                       │   │    │   │
│  │  │  │  bg: danger-bg, border: danger/20%          │   │    │   │
│  │  │  └─────────────────────────────────────────────┘   │    │   │
│  │  │                                                     │    │   │
│  │  │  EMAIL                                              │    │   │
│  │  │  ┌─────────────────────────────────────────────┐   │    │   │
│  │  │  │  you@company.com                             │   │    │   │
│  │  │  └─────────────────────────────────────────────┘   │    │   │
│  │  │                                                     │    │   │
│  │  │  PASSWORD                                           │    │   │
│  │  │  ┌─────────────────────────────────────────────┐   │    │   │
│  │  │  │  ••••••••••••                                │   │    │   │
│  │  │  └─────────────────────────────────────────────┘   │    │   │
│  │  │                                                     │    │   │
│  │  │  ┌─────────────────────────────────────────────┐   │    │   │
│  │  │  │         Sign In  (full width btn-primary)    │   │    │   │
│  │  │  └─────────────────────────────────────────────┘   │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                             │   │
│  │  ┌── Demo Credentials Box ─────────────────────────────┐   │   │
│  │  │  DEMO CREDENTIALS                                    │   │   │
│  │  │  Admin:    admin@leaveflow.com / admin123            │   │   │
│  │  │  Manager:  manager@leaveflow.com / pass123           │   │   │
│  │  │  Employee: employee1@leaveflow.com / pass123         │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Input Focus: border → accent, box-shadow: 0 0 0 3px accent-glow   │
│  Loading State: Spinner + "Signing in..." text, btn opacity 0.7     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Dashboard Page (/dashboard)

```
┌─────────────────────────────────────────────────────────────────────┐
│  DASHBOARD PAGE — /dashboard                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  My Dashboard / Manager Dashboard / Admin Dashboard         │   │
│  │  Overview of your leave status and balances                 │   │
│  │                                        [+ Apply Leave]      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Stats Grid (4 columns) ───────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ 📋       │  │ ⏳       │  │ ✅       │  │ ❌       │  │   │
│  │  │ Total    │  │ Pending  │  │ Approved │  │ Rejected │  │   │
│  │  │ Requests │  │          │  │          │  │          │  │   │
│  │  │   42     │  │   7      │  │   30     │  │   5      │  │   │
│  │  │(accent)  │  │(warning) │  │(success) │  │(danger)  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Manager Only: Team Stats (3 columns) ─────────────────────┐   │
│  │                                                             │   │
│  │  ┌──────────┐  ┌─────────────────────────────────────────┐ │   │
│  │  │ ⏳       │  │  Team on Leave Today                     │ │   │
│  │  │ Team     │  │  ┌────────┐ ┌────────┐ ┌────────┐       │ │   │
│  │  │ Pending  │  │  │ Alice  │ │ Bob    │ │ Carol  │       │ │   │
│  │  │ Approvals│  │  └────────┘ └────────┘ └────────┘       │ │   │
│  │  │   3      │  │  (pill badges, warning-bg)               │ │   │
│  │  └──────────┘  └─────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Admin Only: Org Stats (3 columns) ────────────────────────┐   │
│  │                                                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────────────┐  │   │
│  │  │ 👥       │  │ 📊       │  │  Department Breakdown    │  │   │
│  │  │ Total    │  │ Total    │  │  Engineering ─── 15      │  │   │
│  │  │ Employees│  │ Requests │  │  Marketing   ───  8      │  │   │
│  │  │  45      │  │  120     │  │  Sales       ─── 12      │  │   │
│  │  │(info)    │  │(accent)  │  │  (list with dividers)    │  │   │
│  │  └──────────┘  └──────────┘  └─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Leave Balances Card ───────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Leave Balances                                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │ 🏖 Casual│ │ 🏥 Sick  │ │ 📅 Earned│ │ ...      │     │   │
│  │  │          │ │          │ │          │ │          │     │   │
│  │  │ T: 12    │ │ T: 12    │ │ T: 18    │ │          │     │   │
│  │  │ U: 5     │ │ U: 2     │ │ U: 8     │ │          │     │   │
│  │  │ R: 7     │ │ R: 10    │ │ R: 10    │ │          │     │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │   │
│  │  (T=Total, U=Used, R=Remaining; R<3 → danger color)       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Recent Leaves Card ───────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Recent Leaves                          [View All →]        │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ TYPE        DATES              DAYS  STATUS   APPLIED│   │   │
│  │  │─────────────────────────────────────────────────────│   │   │
│  │  │ 🏖 casual   Jun 1 - Jun 3      3    ● pending Jun 1 │   │   │
│  │  │ 🏥 sick     May 10 - May 11    2    ● approved May 10│  │   │
│  │  │ 📅 earned   Apr 20 - Apr 25    6    ● rejected Apr 20│  │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  (hover row → rgba(255,255,255,0.02) background)           │   │
│  │                                                             │   │
│  │  Empty State:                                               │   │
│  │       📭                                                     │   │
│  │    No leaves yet                                            │   │
│  │  Apply for your first leave to get started                  │   │
│  │  [ Apply for Leave ]                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Loading State: spinner + "Loading dashboard..."                    │
│  Error State: ⚠ icon + error message + [Retry] button              │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 Apply Leave Page (/apply-leave)

```
┌─────────────────────────────────────────────────────────────────────┐
│  APPLY LEAVE PAGE — /apply-leave                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  Apply for Leave                                            │   │
│  │  Submit a new leave request for manager approval            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Form Card (max-width: 600px, centered) ───────────────────┐   │
│  │                                                             │   │
│  │  ┌── Error/Success Banner (conditional) ───────────────┐   │   │
│  │  │  ⚠ / ✅  Message text                               │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  LEAVE TYPE                                                 │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Casual Leave (CL)                             ▼    │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  Options: Casual (12) | Sick (12) | Earned (18)           │   │
│  │           Maternity (182) | Miscarriage (42) | LWP (∞)   │   │
│  │                                                             │   │
│  │  ┌── Date Grid (2 columns) ───────────────────────────┐   │   │
│  │  │                                                     │   │   │
│  │  │  START DATE           END DATE                      │   │   │
│  │  │  ┌──────────────┐    ┌──────────────┐              │   │   │
│  │  │  │ 2026-06-15   │    │ 2026-06-17   │              │   │   │
│  │  │  └──────────────┘    └──────────────┘              │   │   │
│  │  │  (min: today)          (min: start_date)            │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  ┌── Duration Badge (conditional) ────────────────────┐    │   │
│  │  │  Duration: 3 days                                   │    │   │
│  │  │  (accent-glow background, shown when dates valid)   │    │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  REASON                                                     │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Please provide a detailed reason for your leave    │   │   │
│  │  │  request                                             │   │   │
│  │  │                                                      │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  (textarea, 4 rows, min-height: 100px)                     │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │     Submit Leave Request  (full width btn-primary)   │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Validation:                                                        │
│    - All fields required                                            │
│    - End date >= Start date                                         │
│    - Start date >= today                                            │
│    - On success: show message → redirect to /leave-history (1.5s)   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5 Leave History Page (/leave-history)

```
┌─────────────────────────────────────────────────────────────────────┐
│  LEAVE HISTORY PAGE — /leave-history                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  Leave History                                              │   │
│  │  View all your leave requests and their status              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Filter Chips ─────────────────────────────────────────────┐   │
│  │  (All)  (Pending)  (Approved)  (Rejected)  (Cancelled)     │   │
│  │                                                             │   │
│  │  Active: filled accent bg, white text                       │   │
│  │  Inactive: transparent bg, border, text-muted               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Data Table ───────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ TYPE     START DATE  END DATE  DAYS  REASON  STATUS  │  │   │
│  │  │ ACTION                                                       │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ 🏖 casual Jun 1     Jun 3     3     Family  ●pending│  │   │
│  │  │                               trip     [👁️] [Cancel]│  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ 🏥 sick   May 10    May 11    2     Flu     ●approved│  │   │
│  │  │                               [👁️]                  │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ 📅 earned Apr 20    Apr 25    6     Vaca-  ●rejected│  │   │
│  │  │                               tion     [👁️]         │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                             │   │
│  │  Actions per row:                                           │   │
│  │    - 👁️ Detail button (ghost variant)                       │   │
│  │    - Cancel button (only for "pending" status)              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Detail Modal ─────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Leave Details                               [✕]            │   │
│  │  ─────────────────────────────────────────────────────      │   │
│  │                                                             │   │
│  │  Leave Type              Status                             │   │
│  │  🏖 casual               ● pending                          │   │
│  │                                                             │   │
│  │  Start Date              End Date                           │   │
│  │  Jun 1, 2026             Jun 3, 2026                        │   │
│  │                                                             │   │
│  │  Days                    Applied On                         │   │
│  │  3                       Jun 1, 2026 10:30 AM              │   │
│  │                                                             │   │
│  │  Reason                                                    │   │
│  │  Family trip to mountains                                  │   │
│  │                                                             │   │
│  │  ┌── Manager Response (if exists) ─────────────────────┐   │   │
│  │  │  MANAGER RESPONSE                                    │   │   │
│  │  │  ● approved by John Manager                          │   │   │
│  │  │  "Enjoy your trip!"                                  │   │   │
│  │  │  Jun 2, 2026 09:15 AM                                │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Cancel Confirmation Modal ────────────────────────────────┐   │
│  │                                                             │   │
│  │  Cancel Leave Request                       [✕]             │   │
│  │  ─────────────────────────────────────────────────────      │   │
│  │                                                             │   │
│  │  Are you sure you want to cancel your casual leave          │   │
│  │  from Jun 1 to Jun 3?                                      │   │
│  │                                                             │   │
│  │              [Keep Request]  [Yes, Cancel]                  │   │
│  │              btn-secondary    btn-danger                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.6 Pending Requests Page (/pending-requests)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PENDING REQUESTS PAGE — /pending-requests                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  Pending Requests                                           │   │
│  │  Review and manage leave requests from your team            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Data Table ───────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ EMPLOYEE   DEPT       TYPE      DATES      DAYS      │  │   │
│  │  │ REASON                              ACTIONS          │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ Alice K.  Engineering 🏖 casual  Jun 1-3   3         │  │   │
│  │  │ Family trip                       [Approve] [Reject] │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ Bob M.    Marketing   🏥 sick    Jun 5-6   2         │  │   │
│  │  │ Flu recovery                      [Approve] [Reject] │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ Carol S.  Sales       📅 earned  Jun 10-15 6         │  │   │
│  │  │ Vacation                          [Approve] [Reject] │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                             │   │
│  │  Reason column: truncated with ellipsis (max-width: 180px) │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Empty State:                                                       │
│       ✅                                                            │
│    All caught up!                                                   │
│  No pending leave requests to review                                │
│                                                                     │
│  ┌── Action Modal (Approve) ───────────────────────────────────┐   │
│  │                                                             │   │
│  │  Approve Leave Request                       [✕]            │   │
│  │  ─────────────────────────────────────────────────────      │   │
│  │                                                             │   │
│  │  Alice K. is requesting casual leave                       │   │
│  │  from Jun 1 to Jun 3 (3 day(s)).                           │   │
│  │                                                             │   │
│  │  ┌─ Reason quote ──────────────────────────────────────┐   │   │
│  │  │  "Family trip to the mountains"                      │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  COMMENTS (OPTIONAL)                                        │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Add optional comments...                            │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │              [Cancel]  [Yes, Approve]                       │   │
│  │              secondary  btn-success                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Action Modal (Reject) ────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Reject Leave Request                        [✕]            │   │
│  │  ─────────────────────────────────────────────────────      │   │
│  │                                                             │   │
│  │  REASON * (required)                                        │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Provide a reason for rejection (required)           │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │              [Cancel]  [Yes, Reject]                        │   │
│  │              secondary  btn-danger                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.7 Team Overview Page (/team-overview)

```
┌─────────────────────────────────────────────────────────────────────┐
│  TEAM OVERVIEW PAGE — /team-overview                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  Team Overview                                              │   │
│  │  View your team's leave status and availability             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Stats Grid (3 columns) ───────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │   │
│  │  │ ⏳       │  │ 🏖️       │  │          │                 │   │
│  │  │ Pending  │  │ On Leave │  │          │                 │   │
│  │  │ Approvals│  │ Today    │  │          │                 │   │
│  │  │   3      │  │   2      │  │          │                 │   │
│  │  │          │  │ Alice,   │  │          │                 │   │
│  │  │          │  │ Bob      │  │          │                 │   │
│  │  └──────────┘  └──────────┘  └──────────┘                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Pending Requests Table ───────────────────────────────────┐   │
│  │                                                             │   │
│  │  Pending Requests                                           │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ EMPLOYEE    TYPE        DATES          DAYS  STATUS  │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ Alice K.   🏖 casual   Jun 1-3        3    ●pending │  │   │
│  │  │ Bob M.     🏥 sick     Jun 5-6        2    ●pending │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                             │   │
│  │  Empty State:                                               │   │
│  │       ✅                                                    │   │
│  │    No pending requests                                      │   │
│  │  All team requests have been reviewed                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.8 Employees Page (/employees)

```
┌─────────────────────────────────────────────────────────────────────┐
│  EMPLOYEES PAGE — /employees                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  Employees                                                  │   │
│  │  Manage all employees in the system                         │   │
│  │                                        [+ Add Employee]     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Search Bar ───────────────────────────────────────────────┐   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  🔍 Search by name or email...     (max-width: 360) │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  (debounced 300ms search)                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Employee Table ───────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ NAME     EMAIL         ROLE       DEPT    MANAGER    │  │   │
│  │  │ STATUS   ACTIONS                                       │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ Alice K. alice@co.com  employee   Eng.    Bob M.     │  │   │
│  │  │ ● active                [Edit] [Deactivate]          │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ Bob M.   bob@co.com   manager    Mkt.    Carol S.    │  │   │
│  │  │ ● active                [Edit] [Deactivate]          │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ Carol S. carol@co.com  admin      Sales   -          │  │   │
│  │  │ ● inactive              [Edit]                       │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                             │   │
│  │  Role Badges:                                               │   │
│  │    employee → green bg/text                                 │   │
│  │    manager  → amber bg/text                                 │   │
│  │    admin    → indigo bg/text                                │   │
│  │                                                             │   │
│  │  Status Badge: ● active (green) / ● inactive (red)         │   │
│  │  Inactive row: opacity 0.5                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Add Employee Modal ───────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Add New Employee                          [✕]              │   │
│  │  ─────────────────────────────────────────────────────      │   │
│  │                                                             │   │
│  │  NAME                                                       │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Full name                                           │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  EMAIL                                                      │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  email@company.com                                   │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  PASSWORD                                                   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Secure password                                     │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  ┌── 2-Column Grid ──────────────────────────────────┐    │   │
│  │  │  ROLE                  DEPARTMENT                   │    │   │
│  │  │  ┌──────────────┐    ┌──────────────┐              │    │   │
│  │  │  │ employee   ▼ │    │ Engineering▼│              │    │   │
│  │  │  └──────────────┘    └──────────────┘              │    │   │
│  │  │  employee|manager|admin  Eng|Mkt|Sales|HR|...      │    │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │           [Cancel]  [Create Employee]                       │   │
│  │           secondary  btn-primary                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Edit Employee Modal ──────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Same as Add Modal, but:                                    │   │
│  │    - Name pre-filled                                        │   │
│  │    - Email disabled (read-only, opacity 0.5)                │   │
│  │    - Password field omitted                                 │   │
│  │    - Role/Department pre-selected                           │   │
│  │    - Button text: "Save Changes"                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Deactivate Confirmation Modal ────────────────────────────┐   │
│  │                                                             │   │
│  │  Deactivate Employee                       [✕]              │   │
│  │  ─────────────────────────────────────────────────────      │   │
│  │                                                             │   │
│  │  Are you sure you want to deactivate Alice K.?             │   │
│  │  They will lose access to the system, but their            │   │
│  │  historical data will be preserved.                        │   │
│  │                                                             │   │
│  │           [Cancel]  [Yes, Deactivate]                       │   │
│  │           secondary  btn-danger                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.9 System Settings Page (/system-settings)

```
┌─────────────────────────────────────────────────────────────────────┐
│  SYSTEM SETTINGS PAGE — /system-settings                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  System Settings                                            │   │
│  │  Configure organization-wide leave policies                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Form Card (max-width: 500px, centered) ───────────────────┐   │
│  │                                                             │   │
│  │  ┌── Error/Success Banner (conditional) ───────────────┐   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  MAX CASUAL LEAVE (CL) DAYS                                │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  12                                                  │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │  (number input, min=1)                                      │   │
│  │                                                             │   │
│  │  MAX SICK LEAVE (SL) DAYS                                  │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  12                                                  │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  MAX EARNED LEAVE (EL/PL) DAYS                             │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  18                                                  │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │     Save Settings  (full width btn-primary, lg)      │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.10 Manage Admins Page (/manage-admins)

```
┌─────────────────────────────────────────────────────────────────────┐
│  MANAGE ADMINS PAGE — /manage-admins                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  Manage Admins                                              │   │
│  │  Create new admin accounts for system management            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Form Card (max-width: 500px, centered) ───────────────────┐   │
│  │                                                             │   │
│  │  ┌── Error/Success Banner (conditional) ───────────────┐   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  ADMIN NAME                                                 │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Full name                                           │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  EMAIL                                                      │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  admin@company.com                                   │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  PASSWORD                                                   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Secure password                                     │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  Create Admin Account  (full width btn-primary, lg)  │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.11 Organization Reports Page (/organization-reports)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ORG REPORTS PAGE — /organization-reports                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Page Header ──────────────────────────────────────────────┐   │
│  │  Organization Reports                                       │   │
│  │  Organization-wide metrics and employee distribution        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Stats Grid (4 columns) ───────────────────────────────────┐   │
│  │                                                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │ 👥       │ │ 👑       │ │ 📋       │ │ 📊       │     │   │
│  │  │ Total    │ │ Total    │ │ Total    │ │Approved/ │     │   │
│  │  │Employees│ │ Admins   │ │Requests  │ │Rejected  │     │   │
│  │  │  45      │ │  3       │ │  120     │ │ 90 / 20  │     │   │
│  │  │(info)    │ │(accent)  │ │(warning) │ │(success) │     │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Department Breakdown Table ───────────────────────────────┐   │
│  │                                                             │   │
│  │  Department Breakdown                                       │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │ DEPARTMENT       EMPLOYEES    LEAVES                 │  │   │
│  │  │──────────────────────────────────────────────────────│  │   │
│  │  │ Engineering      15           42                     │  │   │
│  │  │ Marketing        8            24                     │  │   │
│  │  │ Sales            12           35                     │  │   │
│  │  │ HR               5            12                     │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Sidebar Navigation (Role-Based)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SIDEBAR NAVIGATION                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Employee Sidebar ─┐  ┌── Manager Sidebar ─┐                   │
│  │                      │  │                    │                   │
│  │  [L] LeaveFlow       │  │  [L] LeaveFlow     │                   │
│  │  ──── EMPLOYEE ────  │  │  ──── MANAGER ───  │                   │
│  │                      │  │                    │                   │
│  │  📊 Dashboard        │  │  📊 Dashboard      │                   │
│  │  ✏️ Apply Leave      │  │  ⏳ Pending Req.   │                   │
│  │  📋 Leave History    │  │  👥 Team Overview  │                   │
│  │                      │  │  ✏️ Apply Leave    │                   │
│  │                      │  │  📋 Leave History  │                   │
│  │  ─────────────────── │  │  ────────────────── │                   │
│  │  👤 User Name        │  │  👤 User Name       │                   │
│  │     user@co.com      │  │     mgr@co.com      │                   │
│  │  [Sign Out]          │  │  [Sign Out]         │                   │
│  └──────────────────────┘  └─────────────────────┘                   │
│                                                                     │
│  ┌── Admin Sidebar ────┐  ┌── Super Admin Sidebar ─┐               │
│  │                      │  │                        │               │
│  │  [L] LeaveFlow       │  │  [L] LeaveFlow         │               │
│  │  ──── ADMIN ─────── │  │  ──── SUPER ADMIN ───  │               │
│  │                      │  │                        │               │
│  │  📊 Dashboard        │  │  📊 Dashboard          │               │
│  │  👥 Employees        │  │  👥 Employees          │               │
│  │  ⏳ Requests         │  │  👑 Manage Admins      │               │
│  │  ✏️ Apply Leave      │  │  ⏳ Requests           │               │
│  │  📋 Leave History    │  │  ⚙️ Settings           │               │
│  │                      │  │  📈 Reports            │               │
│  │                      │  │  ✏️ Apply Leave        │               │
│  │                      │  │  📋 Leave History      │               │
│  │  ─────────────────── │  │  ────────────────────── │               │
│  │  👤 Admin Name       │  │  👤 Super Admin Name    │               │
│  │     admin@co.com     │  │     sa@co.com           │               │
│  │  [Sign Out]          │  │  [Sign Out]             │               │
│  └──────────────────────┘  └────────────────────────┘               │
│                                                                     │
│  Active State: accent-left-border + accent-glow bg + bold text      │
│  Hover State: rgba(255,255,255,0.03) background                    │
│  User Avatar: 32x32 circle, gradient bg, first letter initial      │
│  Mobile: overlay + slide-in transform, backdrop dimmed              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Application Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYOUT                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┬────────────────────────────────────────────────┐  │
│  │             │                                                 │  │
│  │   SIDEBAR   │              MAIN CONTENT                      │  │
│  │  (260px)    │                                                 │  │
│  │  fixed      │  ┌── Page Container ──────────────────────┐    │  │
│  │  left       │  │  padding: 28px 32px                     │    │  │
│  │             │  │  max-width: 1400px                      │    │  │
│  │  ┌───────┐  │  │                                         │    │  │
│  │  │ Logo  │  │  │  ┌── Page Header ─────────────────┐   │    │  │
│  │  ├───────┤  │  │  │  Title    Subtitle    Action    │   │    │  │
│  │  │ Nav   │  │  │  └────────────────────────────────┘   │    │  │
│  │  │ Items │  │  │                                         │    │  │
│  │  │       │  │  │  ┌── Stats Grid ───────────────────┐  │    │  │
│  │  │       │  │  │  │  [StatCard] [StatCard] ...      │  │    │  │
│  │  │       │  │  │  └────────────────────────────────┘  │    │  │
│  │  ├───────┤  │  │                                         │    │  │
│  │  │ User  │  │  │  ┌── Cards / Tables ───────────────┐  │    │  │
│  │  │ Info  │  │  │  │  Content area                    │  │    │  │
│  │  ├───────┤  │  │  └────────────────────────────────┘  │    │  │
│  │  │Logout │  │  │                                         │    │  │
│  │  └───────┘  │  └─────────────────────────────────────────┘    │  │
│  │             │                                                 │  │
│  └─────────────┴────────────────────────────────────────────────┘  │
│                                                                     │
│  Responsive Breakpoints:                                            │
│    > 1200px: Full layout                                            │
│    700-1200px: Sidebar collapsed (icons only)                       │
│    < 700px: Sidebar hidden (hamburger menu, slide-in overlay)       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. UI Flow Diagrams

### 6.1 Authentication Flow (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│              AUTHENTICATION UI FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐                                                   │
│  │ User visits  │                                                   │
│  │ any page     │                                                   │
│  └──────┬───────┘                                                   │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────┐     ┌─────────────────┐                          │
│  │ AuthContext   │────▶│ Check localStorage│                         │
│  │ loads         │     │ for JWT token     │                         │
│  └──────┬───────┘     └────┬────────────┘                          │
│         │                  │                                        │
│         │    ┌─────────────┼──────────────────┐                    │
│         │    │             │                  │                    │
│         │    ▼             ▼                  ▼                    │
│         │  ┌─────┐   ┌──────────┐   ┌──────────────┐             │
│         │  │Valid │   │ No token │   │  Token       │             │
│         │  │Token │   │          │   │  expired     │             │
│         │  └──┬──┘   └────┬─────┘   └──────┬───────┘             │
│         │     │           │                 │                      │
│         │     ▼           ▼                 ▼                      │
│         │  ┌──────┐  ┌────────┐  ┌──────────────┐                │
│         │  │Set   │  │Redirect│  │  Clear token  │                │
│         │  │user  │  │to      │  │  Redirect to  │                │
│         │  │state │  │/login  │  │  /login       │                │
│         │  └──┬───┘  └────────┘  └──────────────┘                │
│         │     │                                                    │
│         │     ▼                                                    │
│         │  ┌──────────────┐                                        │
│         │  │ Redirect to  │                                        │
│         │  │ /dashboard   │                                        │
│         │  └──────────────┘                                        │
│         │                                                          │
│  ┌──────▼───────┐                                                   │
│  │ /login page  │                                                   │
│  │              │                                                   │
│  │ Email input  │                                                   │
│  │ Password inpt│                                                   │
│  │ [Sign In]    │                                                   │
│  └──────┬───────┘                                                   │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────┐     ┌──────────────┐                             │
│  │ POST /auth/  │────▶│ Backend      │                             │
│  │ login        │     │ validates    │                             │
│  └──────────────┘     └──────┬───────┘                             │
│                              │                                      │
│                    ┌─────────┼─────────┐                           │
│                    │                   │                           │
│                    ▼                   ▼                           │
│              ┌──────────┐        ┌──────────┐                     │
│              │ Success  │        │ Error    │                     │
│              │ JWT +    │        │ Show     │                     │
│              │ User     │        │ banner   │                     │
│              └────┬─────┘        └──────────┘                     │
│                   │                                                │
│                   ▼                                                │
│              ┌──────────┐                                          │
│              │ Store JWT│                                          │
│              │ in state │                                          │
│              │ Navigate │                                          │
│              │ to       │                                          │
│              │ dashboard│                                          │
│              └──────────┘                                          │
│                                                                     │
│  Token Storage: React AuthContext (in-memory, no localStorage)     │
│  Auth Header: Authorization: Bearer <token>                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Leave Application Flow (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│              LEAVE APPLICATION UI FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐                                                 │
│  │ Dashboard      │                                                 │
│  │ [Apply Leave]  │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│          ▼                                                          │
│  ┌────────────────┐                                                 │
│  │ /apply-leave   │                                                 │
│  │                │                                                 │
│  │ Select Type    │                                                 │
│  │ ┌────────────┐ │                                                 │
│  │ │ Casual (12)│ │  ← Shows remaining quota                      │
│  │ │ Sick (12)  │ │                                                 │
│  │ │ Earned (18)│ │                                                 │
│  │ └────────────┘ │                                                 │
│  │                │                                                 │
│  │ Pick Dates     │                                                 │
│  │ [Start] [End]  │                                                 │
│  │                │                                                 │
│  │ Duration calc  │ ← Auto-calculated, shown in accent badge       │
│  │ "3 days"       │                                                 │
│  │                │                                                 │
│  │ Enter Reason   │                                                 │
│  │ ┌────────────┐ │                                                 │
│  │ │ textarea   │ │                                                 │
│  │ └────────────┘ │                                                 │
│  │                │                                                 │
│  │ [Submit]       │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│          ▼                                                          │
│  ┌────────────────┐                                                 │
│  │ Client-Side    │                                                 │
│  │ Validation     │                                                 │
│  │                │                                                 │
│  │ ✓ All filled?  │──No──▶ Show error banner                       │
│  │ ✓ End ≥ Start? │──No──▶ Show error banner                       │
│  │ ✓ Start ≥ now? │──No──▶ Show error banner                       │
│  └───────┬────────┘                                                 │
│          │ Yes                                                       │
│          ▼                                                          │
│  ┌────────────────┐                                                 │
│  │ POST /api/leaves│                                                │
│  │ (with JWT)      │                                                │
│  └───────┬────────┘                                                 │
│          │                                                          │
│          ├──── Success ──▶ Show success message                     │
│          │               └──▶ Redirect to /leave-history (1.5s)     │
│          │                                                          │
│          └──── Error ────▶ Show error banner                        │
│                             (e.g. "Insufficient balance")           │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Manager Approval Flow (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│              MANAGER APPROVAL UI FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐                                                 │
│  │ Manager        │                                                 │
│  │ Dashboard      │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│          ▼                                                          │
│  ┌────────────────┐                                                 │
│  │ /pending-      │                                                 │
│  │ requests       │                                                 │
│  │                │                                                 │
│  │ ┌────────────┐ │                                                 │
│  │ │ Table with │ │  ← Employee, Dept, Type, Dates, Days, Reason  │
│  │ │ pending    │ │                                                 │
│  │ │ requests   │ │                                                 │
│  │ │            │ │                                                 │
│  │ │[Approve]   │ │                                                 │
│  │ │[Reject]    │ │  ← Per-row action buttons                     │
│  │ └────────────┘ │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│          ▼                                                          │
│  ┌────────────────┐     ┌──────────────────┐                       │
│  │ Click Approve  │────▶│ Open Modal       │                       │
│  │ or Reject      │     │                  │                       │
│  └────────────────┘     │ Show request     │                       │
│                         │ details + reason │                       │
│                         │                  │                       │
│                         │ Approve:         │                       │
│                         │  Comments (opt.) │                       │
│                         │                  │                       │
│                         │ Reject:          │                       │
│                         │  Reason (req.)   │                       │
│                         └───────┬──────────┘                       │
│                                 │                                   │
│                                 ▼                                   │
│                         ┌──────────────────┐                       │
│                         │ PUT /api/leaves/ │                       │
│                         │ :id/approve      │                       │
│                         │ or :id/reject    │                       │
│                         │ (with JWT)       │                       │
│                         └───────┬──────────┘                       │
│                                 │                                   │
│                    ┌────────────┼────────────┐                     │
│                    │                         │                     │
│                    ▼                         ▼                     │
│              ┌──────────┐             ┌──────────┐                │
│              │ Success  │             │ Error    │                │
│              │ Close    │             │ Show     │                │
│              │ modal    │             │ error    │                │
│              │ Refresh  │             └──────────┘                │
│              │ table    │                                          │
│              └──────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.4 Employee Management Flow (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│              EMPLOYEE MANAGEMENT UI FLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐                                                 │
│  │ /employees     │                                                 │
│  │                │                                                 │
│  │ [Search input] │ ← Debounced 300ms filter                       │
│  │                │                                                 │
│  │ ┌────────────┐ │                                                 │
│  │ │ Employee   │ │                                                 │
│  │ │ Table      │ │  Name, Email, Role, Dept, Manager, Status     │
│  │ │            │ │                                                 │
│  │ │[Edit]      │ │                                                 │
│  │ │[Deactivate]│ │                                                 │
│  │ └────────────┘ │                                                 │
│  │                │                                                 │
│  │ [+ Add Emp]    │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│          ├──── [+ Add] ──▶ Open Add Modal                          │
│          │                 │  Name, Email, Password                 │
│          │                 │  Role (dropdown), Dept (dropdown)      │
│          │                 │  [Create Employee]                     │
│          │                 │                                        │
│          │                 ▼                                        │
│          │                 POST /api/employees                      │
│          │                 → Success: Close modal, refresh table   │
│          │                 → Error: Show alert                     │
│          │                                                          │
│          ├──── [Edit] ───▶ Open Edit Modal                         │
│          │                 │  Name (pre-filled)                     │
│          │                 │  Email (disabled)                      │
│          │                 │  Role, Dept (pre-selected)             │
│          │                 │  [Save Changes]                        │
│          │                 │                                        │
│          │                 ▼                                        │
│          │                 PUT /api/employees/:id                   │
│          │                 → Success: Close modal, refresh table   │
│          │                                                          │
│          └──── [Deactivate] ▶ Open Confirm Modal                   │
│                              │  "Are you sure?"                     │
│                              │  [Cancel] [Yes, Deactivate]          │
│                              │                                      │
│                              ▼                                      │
│                              DELETE /api/employees/:id              │
│                              → Success: Close modal, refresh table  │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.5 Modal State Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│              MODAL STATE FLOW                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                   │
│  │ No Modal │────▶│ Opening  │────▶│ Open     │                   │
│  │ state=null│    │ animate  │     │ state=obj│                   │
│  └──────────┘     └──────────┘     └─────┬────┘                   │
│       ▲                                   │                        │
│       │                                   │                        │
│       │         ┌──────────┐     ┌───────▼──────┐                 │
│       │         │ Closed   │◀────│ Closing      │                 │
│       │         │ animate  │     │ state=null   │                 │
│       └─────────┘          │     └──────────────┘                 │
│                             │                                      │
│  Close Triggers:                                                   │
│    1. ✕ button click                                               │
│    2. Escape key                                                   │
│    3. Overlay click (e.target === overlay)                         │
│    4. Form submission success                                      │
│                                                                     │
│  Body scroll: locked when modal open                               │
│  Animation: scaleIn (0.25s) + fadeIn overlay (0.2s)                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Global UI States

### 7.1 Loading States

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LOADING STATES                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Page Loading:                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │
│  │                    ┌────────┐                               │    │
│  │                    │  ◌     │  Spinner (32px, accent)       │    │
│  │                    └────────┘                               │    │
│  │              Loading dashboard...                           │    │
│  │              (text-muted, centered)                         │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Button Loading:                                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ┌── ◌ ──── Signing in... ─────────────────────┐          │    │
│  │  │  spinner 16px + text                          │          │    │
│  │  │  opacity: 0.7, cursor: not-allowed            │          │    │
│  │  └──────────────────────────────────────────────┘          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  StatCard Loading:                                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ┌──────────────────────────────────────────────┐          │    │
│  │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (pulse anim)     │          │    │
│  │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                              │          │    │
│  │  └──────────────────────────────────────────────┘          │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Empty States

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EMPTY STATES                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │
│  │                      📭  (3rem, opacity 0.5)               │    │
│  │                                                             │    │
│  │               No leave requests found                       │    │
│  │            (1.1rem, font-weight: 600)                       │    │
│  │                                                             │    │
│  │      There are no pending leave requests to display         │    │
│  │            (0.85rem, text-muted, max-width: 360px)         │    │
│  │                                                             │    │
│  │                  [ Apply for Leave ]                        │    │
│  │                  (optional CTA button)                      │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Contextual Icons:                                                  │
│    📭 No data    ⚠️ Error    ✅ All caught up    👥 No employees   │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.3 Error States

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ERROR STATES                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Inline Error Banner (in forms):                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │  ⚠  Error message text goes here                    │   │    │
│  │  │  bg: danger-bg (rgba(244,63,94,0.12))               │   │    │
│  │  │  border: 1px solid rgba(244,63,94,0.2)              │   │    │
│  │  │  color: danger (#f43f5e)                             │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Success Banner (in forms):                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │  ✅  Success message text goes here                  │   │    │
│  │  │  bg: success-bg (rgba(16,185,129,0.12))             │   │    │
│  │  │  border: 1px solid rgba(16,185,129,0.2)             │   │    │
│  │  │  color: success (#10b981)                            │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Page-Level Error:                                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                                                             │    │
│  │                      ⚠️  (3rem)                             │    │
│  │                                                             │    │
│  │            Failed to load dashboard                         │    │
│  │              (error message text)                           │    │
│  │                                                             │    │
│  │                  [ Retry ]                                  │    │
│  │                  btn-primary                                │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Responsive Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPONSIVE BREAKPOINTS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Desktop (>1200px) ────────────────────────────────────────┐   │
│  │  ┌──────┬──────────────────────────────────────────────┐    │   │
│  │  │260px │              Content                         │    │   │
│  │  │side- │              (4-col grid)                    │    │   │
│  │  │ bar  │                                              │    │   │
│  │  └──────┴──────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Tablet (900-1200px) ──────────────────────────────────────┐   │
│  │  ┌──────┬──────────────────────────────────────────────┐    │   │
│  │  │260px │              Content                         │    │   │
│  │  │side- │              (2-col grid for stat cards)     │    │   │
│  │  │ bar  │                                              │    │   │
│  │  └──────┴──────────────────────────────────────────────┘    │   │
│  │  .grid-3 → 2 columns                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Mobile (<700px) ──────────────────────────────────────────┐   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │  ☰  LeaveFlow                        [Sign Out]      │    │   │
│  │  ├──────────────────────────────────────────────────────┤    │   │
│  │  │                                                      │    │   │
│  │  │              Content (1-column)                      │    │   │
│  │  │              .grid-2, .grid-3, .grid-4 → 1 column    │    │   │
│  │  │                                                      │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  │                                                             │   │
│  │  Sidebar: Hidden, triggered by hamburger menu               │   │
│  │  Overlay: rgba(0,0,0,0.5) backdrop                          │   │
│  │  Transform: slide-in from left                              │   │
│  │  Page padding: 20px 16px (reduced from 28px 32px)          │   │
│  │  Page header: Stacks vertically (title + button)            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Grid Collapse Rules:                                               │
│    .grid-4: 1200px → 2col, 700px → 1col                            │
│    .grid-3: 900px → 2col, 700px → 1col                             │
│    .grid-2: 700px → 1col                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Interactive States & Animations

```
┌─────────────────────────────────────────────────────────────────────┐
│                 ANIMATIONS & TRANSITIONS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Page Entry Animation (fadeUp):                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  @keyframes fadeUp {                                        │    │
│  │    from { opacity: 0; transform: translateY(12px); }       │    │
│  │    to   { opacity: 1; transform: translateY(0); }          │    │
│  │  }                                                          │    │
│  │  Applied to: .page-header, .grid-4, all major sections     │    │
│  │  Staggered delay: 0.05s, 0.1s, 0.15s per section          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Spinner Animation:                                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  @keyframes spin { to { transform: rotate(360deg); } }     │    │
│  │  Duration: 0.6s linear infinite                            │    │
│  │  Accent border-top color on neutral border                 │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Table Row Hover:                                                   │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  onMouseEnter → background: rgba(255,255,255,0.02)        │    │
│  │  onMouseLeave → background: transparent                    │    │
│  │  Transition: var(--transition) [0.25s cubic-bezier]       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Card Hover (.glass-hover):                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  border-color → rgba(255,255,255,0.1)                      │    │
│  │  box-shadow → 0 4px 20px rgba(79,70,229,0.1)             │    │
│  │  Transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Button Hover:                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Primary/Success/Danger → opacity: 0.9                     │    │
│  │  Secondary → border-color: var(--accent)                   │    │
│  │  Transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Button Click:                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  CTA buttons: translateY(-2px) on hover                    │    │
│  │  Resets to translateY(0) on leave                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Sidebar Active Item:                                               │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  border-left: 3px solid var(--accent)                      │    │
│  │  background: var(--accent-glow)                            │    │
│  │  font-weight: 600                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Modal Animations:                                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Overlay: fadeIn 0.2s ease                                 │    │
│  │  Panel: scaleIn 0.25s ease                                 │    │
│  │    from: opacity 0, scale(0.95), translateY(10px)         │    │
│  │    to:   opacity 1, scale(1), translateY(0)               │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Input Focus:                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  border-color: var(--accent)                               │    │
│  │  box-shadow: 0 0 0 3px var(--accent-glow)                  │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Glassmorphism Design Language

```
┌─────────────────────────────────────────────────────────────────────┐
│                 GLASSMORPHISM DESIGN PRINCIPLES                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  The entire UI follows a dark glassmorphism aesthetic:              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  1. TRANSLUCENT SURFACES                                    │   │
│  │     background: rgba(22, 24, 58, 0.85)                     │   │
│  │     backdrop-filter: blur(16px)                             │   │
│  │     → Cards, modals, sidebar all use glass effect           │   │
│  │                                                             │   │
│  │  2. SUBTLE BORDERS                                          │   │
│  │     border: 1px solid rgba(255, 255, 255, 0.05)            │   │
│  │     → Nearly invisible, separates surfaces                  │   │
│  │                                                             │   │
│  │  3. DEPTH VIA SHADOWS                                       │   │
│  │     box-shadow on hover creates elevation                   │   │
│  │     Purple-tinted shadow: rgba(79, 70, 229, 0.1)          │   │
│  │                                                             │   │
│  │  4. GRADIENT ACCENTS                                        │   │
│  │     Primary: #4f46e5 → #4338ca (indigo)                    │   │
│  │     Secondary: #4f46e5 → #7c3aed (indigo → violet)         │   │
│  │     Used in: buttons, logos, active states                  │   │
│  │                                                             │   │
│  │  5. DARK BACKGROUND LAYERS                                  │   │
│  │     Deepest: #0a0b14 (page bg)                              │   │
│  │     Mid: #0f1123 (sidebar, panels)                          │   │
│  │     Surface: #16183a / rgba(22,24,58,0.85) (cards)         │   │
│  │     → Creates subtle depth hierarchy                        │   │
│  │                                                             │   │
│  │  6. ANIMATED BACKDROPS                                      │   │
│  │     BackgroundBeams effect on landing page                  │   │
│  │     Adds visual interest without content interference       │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Component Hierarchy (back to front):                               │
│    1. Page background (#0a0b14)                                     │
│    2. Sidebar (#0f1123)                                             │
│    3. Cards/glass surfaces (rgba(22,24,58,0.85) + blur)            │
│    4. Modals (same glass + overlay dimming)                         │
│    5. Tooltips/toasts (highest z-index)                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. Form Design Patterns

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FORM DESIGN PATTERNS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Input Field:                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  LABEL (0.8rem, uppercase, 0.5px spacing, text-muted)      │    │
│  │                                                             │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │  Placeholder text (text-dim color)                   │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │  bg: rgba(10,11,20,0.6)                                   │    │
│  │  border: 1px solid var(--border)                           │    │
│  │  border-radius: 6px                                        │    │
│  │  padding: 10px 14px                                        │    │
│  │  font-size: 0.9rem                                         │    │
│  │                                                             │    │
│  │  Focus: border-color accent + glow ring                    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Select Field:                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Same as input + custom dropdown arrow SVG                 │    │
│  │  background-image: chevron-down SVG                        │    │
│  │  background-position: right 12px center                    │    │
│  │  padding-right: 36px                                       │    │
│  │  appearance: none (custom styling)                         │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Textarea:                                                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Same as input +                                           │    │
│  │  resize: vertical                                          │    │
│  │  min-height: 100px                                         │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Form Group:                                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  margin-bottom: 18px (between field groups)                │    │
│  │  2-column layout: display: grid, grid-template: 1fr 1fr    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Form Validation Visual Feedback:                                   │
│    - Valid: accent-glow border on submit                           │
│    - Invalid: danger-bg banner at top of form                      │
│    - Loading: button spinner + disabled state                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

> 📄 For related documentation, see:  
> - [High Level Design](05-HLD.md)  
> - [Low Level Design](06-LLD.md)  
> - [User Flows](04-User-Flows.md)  
> - [API Documentation](07-API-Documentation.md)
