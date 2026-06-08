"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { ROUTES } from "@/constants/routes";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
  badge?: number;
}

interface SidebarProps {
  pendingCount?: number;
}

export function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { role, isManager, isAdmin, isSuperAdmin } = useRole();

  const navItems: NavItem[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "📊" },
    { label: "Apply Leave", href: ROUTES.APPLY_LEAVE, icon: "✏️" },
    { label: "Leave History", href: ROUTES.LEAVE_HISTORY, icon: "📋" },
    ...(isManager
      ? [
          {
            label: "Pending Approvals",
            href: ROUTES.PENDING_APPROVALS,
            icon: "⏳",
            badge: pendingCount,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          { label: "Employees", href: ROUTES.EMPLOYEES, icon: "👥" },
          { label: "Analytics", href: ROUTES.ANALYTICS, icon: "📈" },
        ]
      : []),
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] glass-card-static border-r border-[var(--glass-border)] z-40 flex flex-col overflow-hidden max-lg:hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--glass-border)]">
        <span className="text-2xl">🏢</span>
        <div>
          <h1 className="text-base font-bold gradient-text">LeaveFlow</h1>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20"
                  : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="ml-auto bg-[var(--danger)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              ) : null}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--primary)] rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--glass-border)]">
        <p className="text-[10px] text-[var(--text-muted)] text-center">
          LeaveFlow v1.0 — {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
