"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { ROUTES } from "@/constants/routes";
import { getPendingRequests } from "@/services/leaves.service";
import { useUIStore } from "@/store/ui-store";
import {
  LayoutDashboard,
  PenSquare,
  CalendarDays,
  Clock,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: number;
  group: "main" | "admin" | "system";
}

export function Sidebar() {
  const pathname = usePathname();
  const { isManager, isAdmin } = useRole();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isManager) {
      getPendingRequests()
        .then((res) => setPendingCount(res.pending.length))
        .catch(() => {});
    }
  }, [isManager, pathname]);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, group: "main" },
    { label: "Apply Leave", href: ROUTES.APPLY_LEAVE, icon: PenSquare, group: "main" },
    { label: "Leave History", href: ROUTES.LEAVE_HISTORY, icon: CalendarDays, group: "main" },
    ...(isManager
      ? [{
          label: "Pending Approvals",
          href: ROUTES.PENDING_APPROVALS,
          icon: Clock,
          badge: pendingCount,
          group: "main" as const,
        }]
      : []),
    ...(isAdmin
      ? [
          { label: "Employees", href: ROUTES.EMPLOYEES, icon: Users, group: "admin" as const },
          { label: "Analytics", href: ROUTES.ANALYTICS, icon: BarChart3, group: "admin" as const },
        ]
      : []),
    { label: "Settings", href: ROUTES.SETTINGS, icon: Settings, group: "system" },
    { label: "Help", href: ROUTES.HELP, icon: HelpCircle, group: "system" },
  ];

  const mainItems = navItems.filter((i) => i.group === "main");
  const adminItems = navItems.filter((i) => i.group === "admin");
  const systemItems = navItems.filter((i) => i.group === "system");

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    const linkContent = (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
          sidebarCollapsed && "justify-center px-2.5",
          isActive
            ? "bg-[var(--primary)]/10 text-[var(--text-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-[var(--primary)] to-purple-600 rounded-r-full shadow-[0_0_8px_var(--primary-glow)]" />
        )}

        <Icon
          className={cn(
            "shrink-0 transition-all duration-200",
            isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]",
            sidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
          )}
        />

        {!sidebarCollapsed && (
          <>
            <span className="truncate">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className="ml-auto bg-[var(--danger)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                {item.badge}
              </span>
            ) : null}
          </>
        )}

        {sidebarCollapsed && item.badge && item.badge > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--danger)] rounded-full border-2 border-[var(--bg-secondary)]" />
        ) : null}
      </Link>
    );

    return sidebarCollapsed ? (
      <motion.div variants={itemVariants} key={item.href}>
        <Tooltip>
          <TooltipTrigger render={linkContent} />
          <TooltipContent side="right" sideOffset={12}>
            <p className="font-medium">{item.label}</p>
            {item.badge && item.badge > 0 && (
              <p className="text-xs text-muted-foreground">{item.badge} pending</p>
            )}
          </TooltipContent>
        </Tooltip>
      </motion.div>
    ) : (
      <motion.div variants={itemVariants} key={item.href}>
        {linkContent}
      </motion.div>
    );
  };

  const renderGroup = (label: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1">
        {!sidebarCollapsed && (
          <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2">
            {label}
          </p>
        )}
        {items.map(renderNavLink)}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col overflow-hidden max-lg:hidden transition-all duration-300 ease-out",
        "bg-[var(--bg-secondary)]/30 backdrop-blur-2xl border-r border-[var(--glass-border)]",
        sidebarCollapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 py-6 transition-all duration-300",
        sidebarCollapsed ? "px-4 justify-center" : "px-6"
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center shadow-lg shadow-[var(--primary-glow)] shrink-0">
          <span className="text-lg text-white font-bold">L</span>
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-black tracking-tight gradient-text leading-tight">LeaveFlow</h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <motion.nav 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
        }}
        className="flex-1 py-2 px-3 space-y-6 overflow-y-auto"
      >
        {renderGroup("Menu", mainItems)}
        {adminItems.length > 0 && (
          <>
            {!sidebarCollapsed && <Separator className="my-2 opacity-50" />}
            {renderGroup("Admin", adminItems)}
          </>
        )}
        {!sidebarCollapsed && <Separator className="my-2 opacity-50" />}
        {renderGroup("System", systemItems)}
      </motion.nav>

      {/* Collapse Toggle */}
      <div className={cn(
        "p-3 border-t border-[var(--glass-border)]",
        sidebarCollapsed && "flex justify-center"
      )}>
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 transition-all w-full"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
