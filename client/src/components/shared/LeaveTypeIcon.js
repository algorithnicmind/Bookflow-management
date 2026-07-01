'use client'

import AppleEmoji from '@/components/AppleEmoji'

const LEAVE_TYPE_ICONS = {
  casual: '📅',
  sick: '🏥',
  earned: '🌴',
  unpaid: '📋',
  maternity: '👶',
  miscarriage: '💔',
}

export function getLeaveTypeEmoji(type) {
  return LEAVE_TYPE_ICONS[type] || '📋'
}

export default function LeaveTypeIcon({ type, className }) {
  return <AppleEmoji char={getLeaveTypeEmoji(type)} className={className} />
}
