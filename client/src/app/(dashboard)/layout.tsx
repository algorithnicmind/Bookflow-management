import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RoleGuard } from "@/components/guards/role-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard>
      <div className="min-h-screen">
        <Sidebar />
        <div className="flex flex-col lg:pl-[var(--sidebar-width)] transition-all duration-300">
          <Topbar />
          <main className="flex-1 p-4 lg:p-8 animate-fade-in">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </RoleGuard>
  );
}
