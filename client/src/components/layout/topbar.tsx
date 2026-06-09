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
    <header className="sticky top-0 z-30 bg-transparent backdrop-blur-xl px-4 lg:px-8 py-4 transition-all duration-300">
      <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2 pr-4 border border-white/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)]">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 pl-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center">
            <span className="text-sm text-white">🏢</span>
          </div>
          <span className="text-sm font-black tracking-tight gradient-text">LeaveFlow</span>
        </div>

        {/* Page title area (desktop) */}
        <div className="hidden lg:block pl-4">
          <p className="text-sm font-medium text-[var(--text-secondary)]">Dashboard Overview</p>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{user.name}</p>
              <p className="text-[11px] font-medium text-[var(--primary)] uppercase tracking-wider mt-0.5">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center shadow-md shadow-[var(--primary)]/20 group-hover:scale-105 transition-transform">
              <span className="text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-[calc(100%+8px)] w-56 glass-card p-2 z-50 animate-fade-in origin-top-right transform scale-95 opacity-0 [animation:dropdown-enter_0.2s_ease-out_forwards]">
                <div className="px-3 py-3 mb-1 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{user.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.email}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">{user.department} Dept.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 mt-1 rounded-lg text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:text-red-400 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">⏏</span> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
