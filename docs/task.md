# LeaveFlow Frontend — Task Tracker

## Milestone 1: Project Scaffolding + Design System
- [x] Initialize Next.js 14 with TypeScript + Tailwind + App Router
- [x] Install dependencies (shadcn/ui, axios, zustand, zod, react-hook-form, framer-motion, recharts, sonner, date-fns)
- [x] Configure Tailwind with design system tokens
- [x] Set up shadcn/ui (dark theme)
- [x] Create TypeScript type definitions
- [x] 1.4 Animations
- [x] Integrate animation variants into layout and shared components
- [x] Create constants (roles, routes, leave-types)
- [x] Create Axios API client with auth interceptor
- [x] Create Zustand auth store
- [x] 1.0 Critical Fixes
- [x] Rename `proxy.ts` → `middleware.ts` (fix Next.js middleware detection)
- [x] Update routes.ts with new routes (settings, help)
- [x] Create Next.js middleware for auth redirects
- [x] Create RBAC utilities (RoleGuard, useRole hook)
- [x] Build layout shell: Sidebar + Topbar
- [x] 1.2 shadcn/ui Component Library
- [x] Install shadcn components (input, dialog, table, badge, card, select, etc.)
- [ ] Create reusable `DataTable` component
- [x] Create shared components (StatusBadge, LoadingSkeleton, EmptyState)
- [x] 1.1 Design System
- [x] Fix globals.css — resolve CSS variable conflicts, enhance shadows/contrast
- [x] Create `lib/animations.ts` — Framer Motion variant library

## Milestone 2: Authentication System
- [x] Build login page with glassmorphism design
- [x] Create login form with RHF + Zod
- [x] Implement auth service (form-data login)
- [x] Role-based redirect after login
- [x] Logout implementation
- [x] Token expiry handling (401 interceptor)

## Milestone 3: Employee Dashboard
- [x] Dashboard page with stats cards
- [x] 2.2 Dashboard
- [x] Enhance metric cards with trend indicators and Lucide icons
- [x] Add Recharts visualizations for org_stats
- [x] Improve responsive layout
- [x] Leave balance cards with progress indicators
- [x] Recent leaves table
- [x] Quick action buttons
- [x] Manager-specific section (team pending, on-leave-today)
- [x] Admin-specific section (org stats)
- [x] Staggered entry animations

## Milestone 4: Leave Management Module
- [x] Apply Leave page with form
- [x] Leave type selector with balance display
- [x] Date pickers with auto-calculated duration
- [x] Zod validation
- [x] 2.3 Leaves
- [x] Enhance apply-leave form with shadcn
### 2.5 Employees
- [x] Refactor monolith into smaller components
- [x] Use shadcn Dialog
- [x] Add pagination basic history tracking if backend doesn't support list-all-approved)
- [x] Leave History page with table
- [x] Status filter
- [x] Cancel leave functionality

## Milestone 5: Manager Portal
- [x] Pending Approvals page
- [x] Approve dialog with optional comments
- [x] Reject dialog with required comments
- [x] Empty state for no pending requests
- [x] Sidebar pending count badge

## Milestone 6: Admin & Super Admin Panels
- [x] Employee Management page (table + search)
- [x] Add Employee dialog
- [x] Edit Employee dialog
- [x] Deactivate Employee with confirmation
- [x] Super Admin: Create Admin form

## Milestone 7: Analytics Dashboard
- [x] Analytics page (Admin/Super Admin only)
- [x] Department distribution chart
- [x] Leave status breakdown chart
- [x] Org stats cards
- [x] 2.6 Analytics
  - [x] Add multiple chart types and filters
  - [x] Add export functionality

## Milestone 8: Notifications
- [x] 2.8 Notifications
  - [x] Create notification center dropdown
  - [x] Add notification icon to topbar
