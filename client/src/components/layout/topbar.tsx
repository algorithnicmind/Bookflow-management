"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_LABELS } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useState } from "react";

export function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 glass-card-static border-b border-[var(--glass-border)] px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2">
          <span className="text-xl">🏢</span>
          <span className="text-sm font-bold gradient-text">LeaveFlow</span>
        </div>

        {/* Page title area (desktop) */}
        <div className="hidden lg:block" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-sm font-semibold text-[var(--primary)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-[var(--text-primary)]">{user.name}</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {ROLE_LABELS[user.role]} · {user.department}
              </p>
            </div>
            <span className="text-[var(--text-muted)] text-xs">▾</span>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 glass-card-static border border-[var(--glass-border)] rounded-lg py-1 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--danger)] hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <span>⏏</span> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
