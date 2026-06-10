"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { ROUTES } from "@/constants/routes";

interface MobileNavProps {
  pendingCount?: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export function MobileNav({ pendingCount = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const { isManager, isAdmin } = useRole();

  const items: NavItem[] = [
    { label: "Home", href: ROUTES.DASHBOARD, icon: "📊" },
    { label: "Apply", href: ROUTES.APPLY_LEAVE, icon: "✏️" },
    { label: "History", href: ROUTES.LEAVE_HISTORY, icon: "📋" },
    ...(isManager
      ? [{ label: "Approvals", href: ROUTES.PENDING_APPROVALS, icon: "⏳", badge: pendingCount }]
      : []),
    ...(isAdmin
      ? [{ label: "Team", href: ROUTES.EMPLOYEES, icon: "👥" }, { label: "Analytics", href: ROUTES.ANALYTICS, icon: "📈" }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card-static border-t border-[var(--glass-border)] lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all relative",
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="absolute -top-0.5 right-0 bg-[var(--danger)] text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
