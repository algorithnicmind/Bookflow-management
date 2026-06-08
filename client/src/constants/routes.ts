export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  APPLY_LEAVE: "/apply-leave",
  LEAVE_HISTORY: "/leave-history",
  PENDING_APPROVALS: "/pending-approvals",
  EMPLOYEES: "/employees",
  ANALYTICS: "/analytics",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
