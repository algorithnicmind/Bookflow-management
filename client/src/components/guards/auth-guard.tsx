"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard — client-side guard that:
 * 1. Hydrates auth state from localStorage on mount
 * 2. Redirects to login if unauthenticated
 * 3. Shows a loading spinner while checking
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center shadow-lg shadow-[var(--primary-glow)] animate-pulse">
            <span className="text-lg text-white font-bold">L</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
            <span className="text-sm text-[var(--text-muted)] font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
