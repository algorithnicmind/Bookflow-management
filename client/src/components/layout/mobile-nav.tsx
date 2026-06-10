"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  PenSquare,
  CalendarDays,
  Clock,
  Users,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";

interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export function MobileNav() {
  const pathname = usePathname();
  const { isManager, isAdmin } = useRole();

  const navItems: MobileNavItem[] = [
    { label: "Home", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "Apply", href: ROUTES.APPLY_LEAVE, icon: PenSquare },
    { label: "History", href: ROUTES.LEAVE_HISTORY, icon: CalendarDays },
    ...(isManager
      ? [{ label: "Approvals", href: ROUTES.PENDING_APPROVALS, icon: Clock }]
      : []),
    ...(isAdmin
      ? [{ label: "Team", href: ROUTES.EMPLOYEES, icon: Users }]
      : []),
  ];

  // Limit to 5 items for mobile — truncate with "More"
  const visibleItems = navItems.slice(0, 4);
  const hasMore = navItems.length > 4;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-secondary)]/80 backdrop-blur-2xl border-t border-[var(--glass-border)] px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--text-muted)]"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="text-[10px] font-semibold leading-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[var(--primary)] mt-0.5" />
              )}
            </Link>
          );
        })}

        {hasMore && (
          <Link
            href={ROUTES.SETTINGS}
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-[var(--text-muted)] min-w-[60px]"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-semibold leading-tight">More</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
