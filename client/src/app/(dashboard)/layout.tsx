"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthGuard } from "@/components/guards/auth-guard";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Sidebar />
        <div
          className={cn(
            "flex flex-col transition-all duration-300 ease-out",
            sidebarCollapsed
              ? "lg:pl-[var(--sidebar-collapsed)]"
              : "lg:pl-[var(--sidebar-width)]"
          )}
        >
          <Topbar />
          <main className="flex-1 p-4 lg:p-6 xl:p-8 pb-20 lg:pb-8 animate-fade-in">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
