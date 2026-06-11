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
import { Separator } from "@/components/ui/separator";

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
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 group relative overflow-hidden",
          sidebarCollapsed && "justify-center px-2",
          isActive
            ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/5 text-indigo-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-indigo-500/20"
            : "text-white/40 hover:bg-white/[0.04] hover:text-white/80 border border-transparent"
        )}
      >
        {/* Active side indicator */}
        {isActive && (
          <motion.span 
            layoutId="activeNavIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" 
          />
        )}

        {/* Hover background effect */}
        {!isActive && (
          <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
        )}

        <Icon
          className={cn(
            "shrink-0 transition-all duration-300 relative z-10",
            isActive ? "text-indigo-400" : "text-white/30 group-hover:text-white/60",
            sidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
          )}
        />

        {!sidebarCollapsed && (
          <>
            <span className="truncate relative z-10">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 ? (
              <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none shadow-[0_0_10px_rgba(244,63,94,0.4)] relative z-10">
                {item.badge}
              </span>
            ) : null}
          </>
        )}

        {sidebarCollapsed && item.badge !== undefined && item.badge > 0 ? (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
        ) : null}
      </Link>
    );

    return sidebarCollapsed ? (
      <motion.div variants={itemVariants} key={item.href}>
        <Tooltip>
          <TooltipTrigger render={<div />}>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={16} className="bg-[#1a1d2e] border-white/10 text-white shadow-xl">
            <p className="font-semibold text-xs">{item.label}</p>
            {item.badge !== undefined && item.badge > 0 && (
              <p className="text-[10px] text-rose-400 mt-0.5">{item.badge} pending</p>
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
          <p className="px-3 text-[10px] font-bold text-white/25 uppercase tracking-[0.18em] mb-2.5 flex items-center gap-2">
            {label}
            <span className="h-px flex-1 bg-white/[0.04]" />
          </p>
        )}
        <div className="space-y-1.5">
          {items.map(renderNavLink)}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col overflow-hidden max-lg:hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "bg-[#0B0F19] border-r border-slate-800 shadow-2xl",
        sidebarCollapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* ─── Logo Area ─── */}
      <div className={cn(
        "flex items-center gap-3 py-6 shrink-0 transition-all duration-300 relative",
        sidebarCollapsed ? "px-4 justify-center" : "px-6"
      )}>
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0 relative overflow-hidden group">
          <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
          <span className="text-lg text-white font-black tracking-tighter relative z-10">L</span>
        </div>
        
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-black tracking-tight text-white leading-tight">LeaveFlow</h1>
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
        className="flex-1 py-6 px-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
      >
        {renderGroup("Menu", mainItems)}
        {renderGroup("Admin", adminItems)}
        {renderGroup("System", systemItems)}
      </motion.nav>

      {/* ─── Bottom Area: Profile & Toggle ─── */}
      <div className="shrink-0 p-4 border-t border-slate-800/60 bg-[#111827]/30">
        
        {/* User Profile Summary (Only when expanded) */}
        <AnimatePresence>
          {!sidebarCollapsed && user && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="flex items-center gap-3 px-2 py-2 mb-3 overflow-hidden"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 p-[2px] shrink-0">
                <div className="w-full h-full bg-[#090a10] rounded-full flex items-center justify-center border border-white/10">
                  <span className="text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest truncate mt-0.5">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white/30 hover:text-white hover:bg-white/[0.04] transition-all w-full border border-transparent hover:border-white/[0.06]",
            sidebarCollapsed && "justify-center"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-[18px] h-[18px] shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
              <span className="tracking-wide">Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
