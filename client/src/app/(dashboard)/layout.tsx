"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) return null; // Avoid SSR hydration mismatch

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0B0F19] relative overflow-x-hidden text-foreground">
      <Sidebar />
      
      <div 
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          sidebarCollapsed ? "lg:pl-[var(--sidebar-collapsed)]" : "lg:pl-[var(--sidebar-width)]"
        )}
      >
        <Topbar />
        
        <main className="flex-1 px-4 lg:px-8 py-6 w-full max-w-[1600px] mx-auto mb-20 lg:mb-0">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
