import AppleEmoji from '@/components/AppleEmoji'

export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', dot: '#f59e0b' }
    case 'approved':
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', dot: '#10b981' }
    case 'rejected':
      return { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', dot: '#f43f5e' }
    case 'cancelled':
      return { bg: 'rgba(139, 146, 182, 0.15)', text: '#8b92b6', dot: '#8b92b6' }
    default:
      return { bg: 'rgba(139, 146, 182, 0.15)', text: '#8b92b6', dot: '#8b92b6' }
  }
}

export function getLeaveTypeIcon(type) {
  const icons = {
    casual: <AppleEmoji char="📅" />,
    sick: <AppleEmoji char="🏥" />,
    earned: <AppleEmoji char="🌴" />,
    unpaid: <AppleEmoji char="📋" />,
    maternity: <AppleEmoji char="👶" />,
    miscarriage: <AppleEmoji char="💔" />,
  }
  return icons[type] || <AppleEmoji char="📋" />
}


