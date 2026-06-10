"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { ROLE_LABELS } from "@/constants/roles";
import { useRole } from "@/hooks/use-role";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Building2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { isAdmin } = useRole();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [approvalNotifications, setApprovalNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  if (!user) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Manage your account preferences and configuration.
        </p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" /> Appearance
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="w-4 h-4" /> Admin
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="glass-card-flat">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--primary)]" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user.name} className="input-field" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={user.email} disabled className="input-field opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue={user.department} disabled className="input-field opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue={ROLE_LABELS[user.role]} disabled className="input-field opacity-60" />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="btn-primary"
                  onClick={() => toast.info("Profile update will be available when the backend API supports it.")}
                >
                  Save Changes
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="glass-card-flat">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[var(--primary)]" />
                Password & Security
              </CardTitle>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" className="input-field" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" className="input-field" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" className="input-field" />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="btn-primary"
                  onClick={() => toast.info("Password change will be available when the backend API supports it.")}
                >
                  Update Password
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="glass-card-flat">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--primary)]" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Control how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-[var(--glass-border)]">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-[var(--text-muted)]">Receive email for important updates</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-[var(--glass-border)]">
                  <div>
                    <p className="font-medium">Approval Alerts</p>
                    <p className="text-sm text-[var(--text-muted)]">Get notified when a leave is approved or rejected</p>
                  </div>
                  <Switch checked={approvalNotifications} onCheckedChange={setApprovalNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-[var(--glass-border)]">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-[var(--text-muted)]">Receive a weekly summary of leave activity</p>
                  </div>
                  <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="glass-card-flat">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[var(--primary)]" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-[var(--glass-border)]">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-[var(--text-muted)]">Toggle between light and dark theme</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        {isAdmin && (
          <TabsContent value="admin">
            <div className="space-y-6">
              <Card className="glass-card-flat">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[var(--primary)]" />
                    Organization Settings
                  </CardTitle>
                  <CardDescription>Manage organization-wide configurations.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 text-center text-[var(--text-muted)] bg-white/5 rounded-xl border border-dashed border-[var(--glass-border)]">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Department & Policy Management</p>
                    <p className="text-sm mt-1">Coming soon — will allow configuring leave policies, departments, and holiday calendars.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card-flat">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[var(--primary)]" />
                    Holiday Calendar
                  </CardTitle>
                  <CardDescription>Manage public holidays and company events.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 text-center text-[var(--text-muted)] bg-white/5 rounded-xl border border-dashed border-[var(--glass-border)]">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Holiday Calendar</p>
                    <p className="text-sm mt-1">Coming soon — will allow adding and managing company holidays.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
}
