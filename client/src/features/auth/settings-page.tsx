"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { ROLE_LABELS } from "@/constants/roles";
import { useRole } from "@/hooks/use-role";
import { toast } from "sonner";
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Building2,
  Calendar,
  Check,
  ChevronRight
} from "lucide-react";

type TabValue = "profile" | "security" | "notifications" | "appearance" | "admin";

export function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState<TabValue>("profile");
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [approvalNotifications, setApprovalNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  if (!user) return null;

  const tabs: { id: TabValue; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  if (isAdmin) {
    tabs.push({ id: "admin", label: "Admin", icon: Shield });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-md p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-500/10 text-indigo-400 font-bold"
                  : "text-white/60 hover:bg-white/5 hover:text-white font-semibold"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-400" : "opacity-70"}`} />
              <span className="text-sm">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto hidden lg:block" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-[var(--border)]/50">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    Profile Information
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Update your personal details and public profile.</p>
                </div>
                
                <div className="p-6 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-md shadow-indigo-500/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{user.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/70 uppercase tracking-widest">
                          {ROLE_LABELS[user.role]}
                        </span>
                        <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                          {user.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Full Name</label>
                      <input 
                        defaultValue={user.name} 
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Email Address</label>
                      <input 
                        defaultValue={user.email} 
                        disabled 
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-[var(--text-secondary)] cursor-not-allowed" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/25 text-[14px]"
                      onClick={() => toast.info("Profile update will be available when the backend API supports it.")}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-[var(--border)]/50">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    Password & Security
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Manage your password and authentication settings.</p>
                </div>
                
                <div className="p-6 space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Current Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:bg-white/[0.04] focus:border-indigo-500/50 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/60 uppercase tracking-widest">New Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:bg-white/[0.04] focus:border-indigo-500/50 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Confirm New Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:bg-white/[0.04] focus:border-indigo-500/50 outline-none transition-all" 
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 text-sm"
                      onClick={() => toast.info("Password change will be available when the backend API supports it.")}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-[var(--border)]/50">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    Notification Preferences
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Control how and when you receive alerts.</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-slate-700 transition-colors cursor-pointer" onClick={() => setEmailNotifications(!emailNotifications)}>
                    <div>
                      <p className="font-bold text-white text-sm">Email Notifications</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Receive email for important platform updates.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifications ? 'bg-indigo-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-slate-700 transition-colors cursor-pointer" onClick={() => setApprovalNotifications(!approvalNotifications)}>
                    <div>
                      <p className="font-bold text-white text-sm">Approval Alerts</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Get notified when a leave is approved or rejected.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${approvalNotifications ? 'bg-indigo-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${approvalNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-slate-700 transition-colors cursor-pointer" onClick={() => setWeeklyDigest(!weeklyDigest)}>
                    <div>
                      <p className="font-bold text-white text-sm">Weekly Digest</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Receive a weekly summary of team leave activity.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${weeklyDigest ? 'bg-indigo-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${weeklyDigest ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-[var(--border)]/50">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-400" />
                    Appearance
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Customize the interface theme.</p>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-slate-700 transition-colors cursor-pointer" onClick={toggleTheme}>
                    <div>
                      <p className="font-bold text-white text-sm">Dark Mode</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">Toggle between light and dark UI themes.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "admin" && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-[var(--border)]/50">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    Organization Settings
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Manage global configuration for your organization.</p>
                </div>
                
                <div className="p-8">
                  <div className="p-8 text-center bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center">
                    <Building2 className="w-10 h-10 text-[var(--text-muted)] mb-4" />
                    <p className="font-bold text-white">Department & Policy Management</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm">Coming soon — will allow configuring leave policies, departments, and organization rules.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-[var(--border)]/50">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Holiday Calendar
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">Manage public holidays and company events.</p>
                </div>
                
                <div className="p-8">
                  <div className="p-8 text-center bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center">
                    <Calendar className="w-10 h-10 text-[var(--text-muted)] mb-4" />
                    <p className="font-bold text-white">Global Holiday Calendar</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm">Coming soon — will allow adding and managing company holidays that affect leave balance calculations.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
