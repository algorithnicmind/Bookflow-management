"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";
import { getPendingRequests } from "@/services/leaves.service";
import { useUIStore } from "@/store/ui-store";
import { ROLE_LABELS } from "@/constants/roles";
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
  LogOut,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  group: "main" | "admin" | "system";
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isManager, isAdmin } = useRole();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isManager) {
      getPendingRequests()
        .then((res) => setPendingCount(res.pending.length))
        .catch(() => {});
    }
  }, [isManager, pathname]);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const navItems: NavItem[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, group: "main" },
    { label: "Apply Leave", href: ROUTES.APPLY_LEAVE, icon: PenSquare, group: "main" },
    { label: "Leave History", href: ROUTES.LEAVE_HISTORY, icon: CalendarDays, group: "main" },
    ...(isManager
      ? [{
          label: "Approvals",
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

  const itemVariants: any = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    const linkContent = (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 relative group",
          sidebarCollapsed && "justify-center px-2",
          isActive
            ? "bg-[var(--bg-secondary)] text-[var(--primary)] font-semibold shadow-sm"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        )}
      >
        <Icon
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]",
            sidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
          )}
        />

        {!sidebarCollapsed && (
          <>
            <span className="truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ml-auto bg-[var(--danger)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none shadow-sm">
                {item.badge}
              </span>
            )}
          </>
        )}

        {sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--danger)] rounded-full shadow-sm" />
        )}
      </Link>
    );

    return sidebarCollapsed ? (
      <motion.div variants={itemVariants} key={item.href}>
        <Tooltip>
          <TooltipTrigger render={<div />}>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={16}>
            <p className="font-semibold text-xs">{item.label}</p>
            {item.badge !== undefined && item.badge > 0 && (
              <p className="text-[10px] text-[var(--danger)] mt-0.5">{item.badge} pending</p>
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
      <div className="space-y-1 mb-6">
        {!sidebarCollapsed && (
          <p className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            {label}
          </p>
        )}
        <div className="space-y-1">
          {items.map(renderNavLink)}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col max-lg:hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "bg-[var(--bg-primary)] border-r border-[var(--border)]",
        sidebarCollapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* ─── Logo Area ─── */}
      <div className={cn(
        "flex items-center gap-3 py-6 shrink-0 transition-all duration-300",
        sidebarCollapsed ? "px-4 justify-center" : "px-6"
      )}>
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-[15px] text-white font-bold tracking-tight">L</span>
        </div>
        
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)] leading-none">LeaveFlow</h1>
          </div>
        )}
      </div>

      {/* ─── Navigation Area ─── */}
      <motion.nav 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } }
        }}
        className="flex-1 py-2 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        {renderGroup("Menu", mainItems)}
        {renderGroup("Admin", adminItems)}
        {renderGroup("System", systemItems)}
      </motion.nav>

      {/* ─── Bottom Area: Profile & Toggle ─── */}
      <div className="shrink-0 p-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]/50">
        <AnimatePresence>
          {!sidebarCollapsed && user && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-2 py-2 mb-2 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider truncate">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all w-full",
            sidebarCollapsed && "justify-center"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-[16px] h-[16px] shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-[16px] h-[16px] shrink-0" />
              <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
