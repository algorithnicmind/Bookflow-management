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
  Bell,
  Moon,
  Sun,
  User,
  Settings,
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
  "/dashboard": "Dashboard",
  "/apply-leave": "Apply Leave",
  "/leave-history": "Leave History",
  "/pending-approvals": "Pending Approvals",
  "/employees": "Employees",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/help": "Help & Support",
};

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, unreadNotificationsCount } = useUIStore();
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
      { label: "LeaveFlow", href: ROUTES.DASHBOARD },
      { label: pageLabel, href: pathname },
    ];
  }, [pathname]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-transparent backdrop-blur-xl px-4 lg:px-6 py-3 transition-all duration-300">
      <div className="flex items-center justify-between bg-[var(--glass-bg)] rounded-2xl px-4 py-2 border border-[var(--glass-border)] shadow-[var(--shadow-sm)]">
        {/* Left: Mobile logo + Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">L</span>
            </div>
            <span className="text-sm font-black tracking-tight gradient-text">LeaveFlow</span>
          </div>

          {/* Breadcrumbs (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <div key={`${crumb.href}-${i}`} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-[var(--text-primary)]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center/Right: Search & Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 lg:gap-4 ml-4">
          {/* Search / Command Palette Hint */}
          <button 
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all max-w-[240px] w-full"
            onClick={() => setCmdOpen(true)}
          >
            <Search className="w-4 h-4" />
            <span className="text-sm flex-1 text-left">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-tertiary)] border border-[var(--glass-border)]">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          
          <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger render={
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </button>
            } />
            <TooltipContent>
              <p>Switch to {theme === "dark" ? "light" : "dark"} mode</p>
            </TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-white/5 transition-all group outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-medium text-[var(--primary)] uppercase tracking-wider mt-0.5">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>
                <Avatar className="w-9 h-9 ring-2 ring-[var(--primary)]/20 group-hover:ring-[var(--primary)]/40 transition-all">
                  <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            } />

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="pb-2">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  {user.department}
                </Badge>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem render={
                <Link href={ROUTES.SETTINGS} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile & Settings
                </Link>
              } />

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
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
