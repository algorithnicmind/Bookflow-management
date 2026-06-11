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
      <div className="flex items-center justify-between glass-card px-4 py-2.5">
        {/* ─── Left: Mobile Logo & Breadcrumbs ─── */}
        <div className="flex items-center gap-4">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-sm">
              <span className="text-[13px] font-bold text-white">L</span>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">LeaveFlow</span>
          </div>

          {/* Breadcrumbs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <div key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-[var(--text-primary)] tracking-wide">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
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
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all w-[200px] lg:w-[260px] group shadow-sm"
            onClick={() => setCmdOpen(true)}
          >
            <Search className="w-[15px] h-[15px] text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
            <span className="text-[13px] font-medium flex-1 text-left">Quick search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-tertiary)] text-[10px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </button>
          
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--bg-secondary)] transition-all border border-transparent hover:border-[var(--border)]"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-semibold">Switch to {theme === "dark" ? "Light" : "Dark"} Mode</p>
              </TooltipContent>
            </Tooltip>

            {/* Notifications Component */}
            <NotificationsDropdown />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 pl-1.5 sm:pl-3 pr-1.5 py-1.5 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group outline-none border border-transparent hover:border-[var(--border)]">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-semibold text-[var(--primary)] uppercase tracking-widest mt-0.5">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>
                <Avatar className="w-[34px] h-[34px] ring-2 ring-[var(--border)] group-hover:ring-[var(--primary)] transition-all shadow-sm">
                  <AvatarFallback className="bg-[var(--primary)] text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2 bg-[var(--bg-primary)] border-[var(--border)] shadow-lg rounded-xl p-1.5">
                <DropdownMenuLabel className="pb-3 pt-2 px-3">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{user.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{user.email}</p>
                  <Badge className="mt-2 text-[10px] bg-[var(--bg-secondary)] text-[var(--primary)] border-[var(--border)] font-semibold tracking-wider">
                    {user.department}
                  </Badge>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-[var(--border)]" />

                <DropdownMenuItem 
                  onClick={() => router.push(ROUTES.SETTINGS)}
                  className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5 flex items-center"
                >
                  <User className="w-4 h-4 mr-2.5 text-[var(--text-muted)]" />
                  <span className="font-medium text-[13px]">Profile & Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[var(--border)]" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-[var(--danger)] focus:text-[var(--danger)] cursor-pointer rounded-lg px-3 py-2.5 my-0.5"
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
