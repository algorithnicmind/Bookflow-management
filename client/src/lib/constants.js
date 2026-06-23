/**
 * Shared Constants
 * ----------------
 * Centralized constants shared across multiple components.
 */

export const LEAD_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', emoji: '⏳' },
  { value: 'contacted', label: 'Contacted', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.35)', emoji: '📞' },
  { value: 'connected', label: 'Connected', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)', border: 'rgba(14, 165, 233, 0.35)', emoji: '🤝' },
  { value: 'interested', label: 'Interested', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.35)', emoji: '🌟' },
  { value: 'not_interested', label: 'Not Interested', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.35)', emoji: '➖' },
  { value: 'approved', label: 'Approved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', emoji: '✅' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', emoji: '🚫' },
]

export function getStatusMeta(value) {
  return LEAD_STATUS_OPTIONS.find((s) => s.value === value) || LEAD_STATUS_OPTIONS[0]
}
