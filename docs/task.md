# LeaveFlow Frontend — Task Tracker

## Milestone 1: Project Scaffolding + Design System
- [x] Initialize Next.js 14 with TypeScript + Tailwind + App Router
- [x] Install dependencies (shadcn/ui, axios, zustand, zod, react-hook-form, framer-motion, recharts, sonner, date-fns)
- [x] Configure Tailwind with design system tokens
- [ ] Set up shadcn/ui (dark theme)
- [x] Create TypeScript type definitions
- [x] Create constants (roles, routes, leave-types)
- [x] Create Axios API client with auth interceptor
- [x] Create Zustand auth store
- [ ] Create Next.js middleware for auth redirects
- [x] Create RBAC utilities (RoleGuard, useRole hook)
- [x] Build layout shell: Sidebar + Topbar
- [x] Create shared components (StatusBadge, LoadingSkeleton, EmptyState)

## Milestone 2: Authentication System
- [ ] Build login page with glassmorphism design
- [ ] Create login form with RHF + Zod
- [ ] Implement auth service (form-data login)
- [ ] Role-based redirect after login
- [ ] Logout implementation
- [ ] Token expiry handling (401 interceptor)

## Milestone 3: Employee Dashboard
- [ ] Dashboard page with stats cards
- [ ] Leave balance cards with progress indicators
- [ ] Recent leaves table
- [ ] Quick action buttons
- [ ] Manager-specific section (team pending, on-leave-today)
- [ ] Admin-specific section (org stats)
- [ ] Staggered entry animations

## Milestone 4: Leave Management Module
- [ ] Apply Leave page with form
- [ ] Leave type selector with balance display
- [ ] Date pickers with auto-calculated duration
- [ ] Zod validation
- [ ] Leave History page with table
- [ ] Status filter
- [ ] Cancel leave functionality

## Milestone 5: Manager Portal
- [ ] Pending Approvals page
- [ ] Approve dialog with optional comments
- [ ] Reject dialog with required comments
- [ ] Empty state for no pending requests
- [ ] Sidebar pending count badge

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
