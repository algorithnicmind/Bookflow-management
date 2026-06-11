"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";
import { getPendingRequests } from "@/services/leaves.service";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BarChart3,
  HelpCircle,
  LogOut,
  Plus,
  Building2
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isManager, isAdmin } = useRole();
  const { logout } = useAuthStore();
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

  const navItems = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "Leave Requests", href: ROUTES.LEAVE_HISTORY, icon: CalendarDays },
    ...(isManager
      ? [{ label: "Manager Approvals", href: ROUTES.PENDING_APPROVALS, icon: CheckSquare }]
      : []),
    ...(isAdmin || isManager
      ? [{ label: "Reports", href: ROUTES.ANALYTICS, icon: BarChart3 }]
      : []),
  ];

  const renderNavLink = (item: any) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-4 px-4 py-3 mx-4 rounded-xl text-[14px] font-medium transition-all duration-200 group mb-1",
          isActive
            ? "bg-[#083A81] text-white shadow-md"
            : "text-gray-600 hover:bg-[#f4f7fb] hover:text-[#083A81]"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 transition-colors",
            isActive ? "text-white" : "text-gray-400 group-hover:text-[#083A81]"
          )}
        />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col max-lg:hidden bg-[#f8fafc] border-r border-gray-200 w-[260px]"
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 py-8 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#083A81] flex items-center justify-center shrink-0 shadow-sm text-white">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-xl font-bold tracking-tight text-[#083A81] leading-none mb-1">
            Acme Corp
          </h1>
          <p className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">
            Enterprise HR
          </p>
        </div>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="space-y-1">
          {navItems.map(renderNavLink)}
        </div>
      </nav>

      {/* Bottom Area */}
      <div className="shrink-0 p-4 pb-6 space-y-2">
        <Link 
          href={ROUTES.APPLY_LEAVE}
          className="flex items-center justify-center gap-2 w-full bg-[#083A81] hover:bg-[#062a60] text-white py-3 rounded-xl font-medium transition-colors mb-6 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </Link>
        
        <Link
          href={ROUTES.HELP}
          className="flex items-center gap-4 px-4 py-2.5 mx-0 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-[#f4f7fb] hover:text-[#083A81] transition-all group"
        >
          <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-[#083A81]" />
          <span>Help Center</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-2.5 mx-0 rounded-xl text-[14px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group w-full"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
