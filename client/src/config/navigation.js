import AppleEmoji from '@/components/AppleEmoji'

export const NAV_ITEMS = {
  employee: [
    { href: '/dashboard', label: 'Dashboard', icon: <AppleEmoji char="📊" /> },
    { href: '/apply-leave', label: 'Apply Leave', icon: <AppleEmoji char="✏️" /> },
    { href: '/leave-history', label: 'Leave History', icon: <AppleEmoji char="📋" /> },
  ],
  manager: [
    { href: '/dashboard', label: 'Dashboard', icon: <AppleEmoji char="📊" /> },
    { href: '/pending-requests', label: 'Pending Requests', icon: <AppleEmoji char="⏳" /> },
    { href: '/team-overview', label: 'Team Overview', icon: <AppleEmoji char="👥" /> },
    { href: '/apply-leave', label: 'Apply Leave', icon: <AppleEmoji char="✏️" /> },
    { href: '/leave-history', label: 'Leave History', icon: <AppleEmoji char="📋" /> },
  ],
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: <AppleEmoji char="📊" /> },
    { href: '/employees', label: 'Employees', icon: <AppleEmoji char="👥" /> },
    { href: '/pending-requests', label: 'Requests', icon: <AppleEmoji char="⏳" /> },
    { href: '/system-settings', label: 'Settings', icon: <AppleEmoji char="⚙️" /> },
    { href: '/audit-logs', label: 'Audit Logs', icon: <AppleEmoji char="🔍" /> },
    { href: '/apply-leave', label: 'Apply Leave', icon: <AppleEmoji char="✏️" /> },
    { href: '/leave-history', label: 'Leave History', icon: <AppleEmoji char="📋" /> },
  ],
  super_admin: [
    { href: '/dashboard', label: 'Dashboard', icon: <AppleEmoji char="📊" /> },
    { href: '/employees', label: 'Employees', icon: <AppleEmoji char="👥" /> },
    { href: '/manage-admins', label: 'Manage Admins', icon: <AppleEmoji char="👑" /> },
    { href: '/pending-requests', label: 'Requests', icon: <AppleEmoji char="⏳" /> },
    { href: '/system-settings', label: 'Settings', icon: <AppleEmoji char="⚙️" /> },
    { href: '/organization-reports', label: 'Reports', icon: <AppleEmoji char="📈" /> },
    { href: '/audit-logs', label: 'Audit Logs', icon: <AppleEmoji char="🔍" /> },
    { href: '/apply-leave', label: 'Apply Leave', icon: <AppleEmoji char="✏️" /> },
    { href: '/leave-history', label: 'Leave History', icon: <AppleEmoji char="📋" /> },
  ],
}

export const PLATFORM_OWNER_ITEMS = [
  { href: '/leads', label: 'Leads', icon: <AppleEmoji char="🎯" /> },
  { href: '/owner-contacts', label: 'Contact Messages', icon: <AppleEmoji char="📨" /> },
  { href: '/platform-owners', label: 'Platform Owners', icon: <AppleEmoji char="👥" /> },
  { href: '/tenants', label: 'Provisioning', icon: <AppleEmoji char="🏗️" /> },
  { href: '/organizations', label: 'Organizations', icon: <AppleEmoji char="🏢" /> },
]
