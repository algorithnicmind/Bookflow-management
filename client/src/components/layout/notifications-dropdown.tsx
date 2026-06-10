"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Leave Request Approved",
    message: "Your sick leave request for Oct 12 has been approved.",
    type: "success",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: "2",
    title: "Pending Approval",
    message: "You have a new leave request from John Doe pending approval.",
    type: "warning",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "3",
    title: "System Update",
    message: "LeaveFlow will undergo maintenance this Sunday at 2 AM EST.",
    type: "info",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  }
];

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Update the store count just for reference if needed elsewhere
  const setUnreadNotificationsCount = useUIStore(state => state.setUnreadNotificationsCount);
  
  useEffect(() => {
    setUnreadNotificationsCount(unreadCount);
  }, [unreadCount, setUnreadNotificationsCount]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-[var(--warning)]" />;
      case 'error': return <XCircle className="w-5 h-5 text-[var(--danger)]" />;
      case 'info':
      default: return <AlertCircle className="w-5 h-5 text-[var(--info)]" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button
          className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all outline-none"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--danger)] rounded-full ring-2 ring-[var(--bg-primary)]" />
          )}
        </button>
      } />
      
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden glass-card border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]/50">
          <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
              className="h-auto p-0 text-xs text-[var(--primary)] hover:text-[var(--primary)] hover:bg-transparent font-semibold"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--text-muted)]">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`p-4 border-b border-[var(--glass-border)] last:border-0 cursor-pointer focus:bg-white/5 rounded-none transition-colors ${!notification.read ? 'bg-white/[0.02]' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  markAsRead(notification.id);
                }}
              >
                <div className="flex gap-3 w-full">
                  <div className="shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-[var(--primary)] mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-1.5 leading-snug">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
