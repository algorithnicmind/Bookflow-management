"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;

  // Notifications panel
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
  toggleNotificationsPanel: () => void;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: (count: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      // Theme
      theme: "dark",
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),

      // Notifications
      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open) =>
        set({ notificationsPanelOpen: open }),
      toggleNotificationsPanel: () =>
        set((s) => ({
          notificationsPanelOpen: !s.notificationsPanelOpen,
        })),
      unreadNotificationsCount: 0,
      setUnreadNotificationsCount: (count) =>
        set({ unreadNotificationsCount: count }),
    }),
    {
      name: "leaveflow-ui-settings",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
