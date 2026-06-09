"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { ROUTES } from "@/constants/routes";
import { getPendingRequests } from "@/services/leaves.service";

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
  const [actualCount, setActualCount] = useState(pendingCount);

  useEffect(() => {
    if (isManager) {
      getPendingRequests()
        .then((res) => setActualCount(res.pending.length))
        .catch(() => {});
    }
  }, [isManager, pathname]);


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
            badge: actualCount,
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
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] bg-[var(--bg-secondary)]/30 backdrop-blur-3xl z-40 flex flex-col overflow-hidden max-lg:hidden shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
      {/* Logo */}
      <div className="flex items-center gap-4 px-8 py-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center shadow-lg shadow-[var(--primary-glow)]">
          <span className="text-xl text-white">🏢</span>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight gradient-text">LeaveFlow</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-4 space-y-2 overflow-y-auto mt-4">
        <p className="px-4 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Main Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--primary)] to-purple-600 rounded-r-full shadow-[0_0_12px_var(--primary)]" />
              )}
              
              <span className={cn(
                "text-xl transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )}>{item.icon}</span>
              
              <span className="z-10">{item.label}</span>
              
              {item.badge && item.badge > 0 ? (
                <span className="ml-auto bg-[var(--danger)] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-[var(--danger)]/20 z-10">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6">
        <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 shadow-inner">
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">LeaveFlow v1.0</p>
          <p className="text-[10px] text-[var(--text-muted)]">Enterprise Edition</p>
        </div>
      </div>
    </aside>
  );
}
