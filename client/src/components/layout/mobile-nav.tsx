"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";
import { ROUTES } from "@/constants/routes";
import { useUIStore } from "@/store/ui-store";
import {
  LayoutDashboard,
  PenSquare,
  CalendarDays,
  Clock,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const { isManager } = useRole();

  const mainLinks = [
    { href: ROUTES.DASHBOARD, icon: LayoutDashboard, label: "Home" },
    { href: ROUTES.APPLY_LEAVE, icon: PenSquare, label: "Apply" },
    { href: ROUTES.LEAVE_HISTORY, icon: CalendarDays, label: "History" },
    ...(isManager
      ? [{ href: ROUTES.PENDING_APPROVALS, icon: Clock, label: "Approvals" }]
      : []),
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-[#04050b] via-[#04050b]/90 to-transparent pointer-events-none">
      <div className="mx-auto max-w-md bg-[#131627]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto flex items-center justify-around">
        {mainLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-xl outline-none group"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavActive"
                  className="absolute inset-0 bg-indigo-500/15 rounded-xl border border-indigo-500/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              
              {/* Active dot indicator */}
              {isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 mb-1 transition-all duration-300 relative z-10",
                  isActive
                    ? "text-indigo-400 scale-110"
                    : "text-white/40 group-hover:text-white/70"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold transition-all duration-300 relative z-10",
                  isActive ? "text-indigo-200" : "text-white/30"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}

        {/* More Menu (Sheet) */}
        <Sheet>
          <SheetTrigger className="relative flex flex-col items-center justify-center w-[4.5rem] h-14 rounded-xl outline-none group hover:bg-white/5 transition-colors">
            <Menu className="w-5 h-5 mb-1 text-white/40 group-hover:text-white/70 transition-colors" />
            <span className="text-[10px] font-semibold text-white/30">More</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#090a10] border-t border-white/10 rounded-t-3xl pb-10">
            <div className="flex flex-col gap-1 mt-6">
              <Link href={ROUTES.EMPLOYEES} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <span className="font-semibold text-sm">Employees Directory</span>
              </Link>
              <Link href={ROUTES.ANALYTICS} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <span className="font-semibold text-sm">Analytics Dashboard</span>
              </Link>
              <div className="h-px bg-white/10 my-2" />
              <Link href={ROUTES.SETTINGS} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <span className="font-semibold text-sm">Settings</span>
              </Link>
              <Link href={ROUTES.HELP} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <span className="font-semibold text-sm">Help & Support</span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
