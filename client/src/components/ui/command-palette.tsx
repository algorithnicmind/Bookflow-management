"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, CalendarDays, LayoutDashboard, Clock, Settings, User } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function CommandPalette({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 max-w-xl glass-card bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg backdrop-blur-2xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command className="flex w-full flex-col overflow-hidden rounded-xl bg-transparent text-[var(--text-primary)]">
          <div className="flex items-center border-b border-[var(--glass-border)] px-4">
            <Search className="mr-2 h-5 w-5 shrink-0 text-[var(--text-muted)]" />
            <Command.Input
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search features, actions, or employees..."
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-[var(--text-muted)]">
              No results found.
            </Command.Empty>
            
            <Command.Group heading="Navigation" className="text-xs font-semibold text-[var(--text-secondary)] px-2 py-1.5 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => router.push(ROUTES.DASHBOARD))}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer aria-selected:bg-white/10 aria-selected:text-[var(--primary)] transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push(ROUTES.APPLY_LEAVE))}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer aria-selected:bg-white/10 aria-selected:text-[var(--primary)] transition-colors"
              >
                <CalendarDays className="h-4 w-4" />
                <span>Apply for Leave</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push(ROUTES.LEAVE_HISTORY))}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer aria-selected:bg-white/10 aria-selected:text-[var(--primary)] transition-colors"
              >
                <Clock className="h-4 w-4" />
                <span>Leave History</span>
              </Command.Item>
            </Command.Group>
            
            <Command.Separator className="h-px bg-[var(--glass-border)] my-1" />

            <Command.Group heading="Settings" className="text-xs font-semibold text-[var(--text-secondary)] px-2 py-1.5 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => router.push(ROUTES.SETTINGS))}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer aria-selected:bg-white/10 aria-selected:text-[var(--primary)] transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push(ROUTES.SETTINGS))}
                className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer aria-selected:bg-white/10 aria-selected:text-[var(--primary)] transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>System Preferences</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
