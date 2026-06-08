# LeaveFlow Frontend — Task Tracker

## Milestone 1: Project Scaffolding + Design System
- [x] Initialize Next.js 14 with TypeScript + Tailwind + App Router
- [x] Install dependencies (shadcn/ui, axios, zustand, zod, react-hook-form, framer-motion, recharts, sonner, date-fns)
- [x] Configure Tailwind with design system tokens
- [x] Set up shadcn/ui (dark theme)
- [x] Create TypeScript type definitions
- [x] Create constants (roles, routes, leave-types)
- [x] Create Axios API client with auth interceptor
- [x] Create Zustand auth store
- [x] Create Next.js middleware for auth redirects
- [x] Create RBAC utilities (RoleGuard, useRole hook)
- [x] Build layout shell: Sidebar + Topbar
- [x] Create shared components (StatusBadge, LoadingSkeleton, EmptyState)

## Milestone 2: Authentication System
- [x] Build login page with glassmorphism design
- [x] Create login form with RHF + Zod
- [x] Implement auth service (form-data login)
- [x] Role-based redirect after login
- [x] Logout implementation
- [x] Token expiry handling (401 interceptor)

## Milestone 3: Employee Dashboard
- [x] Dashboard page with stats cards
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
- [ ] Employee Management page (table + search)
- [ ] Add Employee dialog
- [ ] Edit Employee dialog
- [ ] Deactivate Employee with confirmation
- [ ] Super Admin: Create Admin form

## Milestone 7: Analytics Dashboard
- [ ] Analytics page (Admin/Super Admin only)
- [ ] Department distribution chart
- [ ] Leave status breakdown chart
- [ ] Org stats cards
