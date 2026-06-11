"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { ROLE_LABELS } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import {
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  User,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationsDropdown } from "./notifications-dropdown";
import { CommandPalette } from "@/components/ui/command-palette";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/apply-leave": "Apply for Leave",
  "/leave-history": "Leave History",
  "/pending-approvals": "Pending Approvals",
  "/employees": "Employee Management",
  "/analytics": "Analytics Dashboard",
  "/settings": "Account Settings",
  "/help": "Help & Support",
};

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  const breadcrumbs = useMemo(() => {
    const pageLabel = ROUTE_LABELS[pathname] || "Page";
    return [
      { label: "Home", href: ROUTES.DASHBOARD },
      { label: pageLabel, href: pathname },
    ];
  }, [pathname]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-8 py-4 transition-all duration-300">
      <div className="flex items-center justify-between bg-[#0B0F19]/60 backdrop-blur-2xl rounded-2xl px-4 py-2.5 border border-slate-800 shadow-lg shadow-black/20">
        {/* ─── Left: Mobile Logo & Breadcrumbs ─── */}
        <div className="flex items-center gap-4">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-white">L</span>
            </div>
            <span className="text-[15px] font-black tracking-tight text-white">LeaveFlow</span>
          </div>

          {/* Breadcrumbs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <div key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                )}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-bold text-white tracking-wide">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-white/50 hover:text-white transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* ─── Right: Actions & Profile ─── */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-5">
          {/* Command Palette Trigger */}
          <button 
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl text-white/50 hover:text-white transition-all w-[200px] lg:w-[260px] group"
            onClick={() => setCmdOpen(true)}
          >
            <Search className="w-[15px] h-[15px] text-white/30 group-hover:text-indigo-400 transition-colors" />
            <span className="text-[13px] font-medium flex-1 text-left">Quick search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-bold text-white/50 group-hover:text-white/80 transition-colors">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </button>
          
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </TooltipTrigger>
              <TooltipContent className="bg-[#1a1d2e] border-white/10">
                <p className="text-xs font-semibold">Switch to {theme === "dark" ? "Light" : "Dark"} Mode</p>
              </TooltipContent>
            </Tooltip>

            {/* Notifications Component */}
            <NotificationsDropdown />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 pl-1.5 sm:pl-3 pr-1.5 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all group outline-none border border-transparent hover:border-white/[0.06]">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mt-0.5">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>
                <Avatar className="w-[34px] h-[34px] ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition-all shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500 text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#0d0e18] border-white/10 shadow-2xl rounded-xl p-1.5">
                <DropdownMenuLabel className="pb-3 pt-2 px-3">
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-white/50 mt-0.5 truncate">{user.email}</p>
                  <Badge className="mt-2 text-[10px] bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-semibold tracking-wider hover:bg-indigo-500/20">
                    {user.department}
                  </Badge>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem 
                  onClick={() => router.push(ROUTES.SETTINGS)}
                  className="focus:bg-white/5 cursor-pointer rounded-lg px-3 py-2.5 my-0.5 flex items-center"
                >
                  <User className="w-4 h-4 mr-2.5 text-white/50" />
                  <span className="font-medium text-[13px]">Profile & Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/5" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer rounded-lg px-3 py-2.5 my-0.5"
                >
                  <LogOut className="w-4 h-4 mr-2.5" />
                  <span className="font-semibold text-[13px]">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
    </header>
  );
}
