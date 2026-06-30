'use client'

export default function FloatingButton({ isOpen, setIsOpen, unreadCount }) {
  if (isOpen) return null

  return (
    <button
      onClick={() => setIsOpen(true)}
      style={{
        width: 58,
        height: 58,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        border: 'none',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(79, 70, 229, 0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(79, 70, 229, 0.4)'
      }}
    >
      {unreadCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            background: '#f43f5e',
            color: '#fff',
            borderRadius: '50%',
            width: 22,
            height: 22,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(244, 63, 94, 0.5)'
          }}
        >
          {unreadCount}
        </div>
      )}
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  )
}
