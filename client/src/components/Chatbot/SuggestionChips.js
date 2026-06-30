'use client'

export default function SuggestionChips({ sessionState, handleSend }) {
  const getSuggestions = () => {
    if (!sessionState || !sessionState.step) {
      return [
        { label: '📊 Check Balances', text: 'What is my leave balance?' },
        { label: '📜 Sick Leave Policy', text: 'What is the sick leave policy?' },
        { label: '✈️ Apply for Leave', text: 'I want to apply for leave' }
      ]
    }
    
    const step = sessionState.step
    if (step === 'awaiting_type') {
      return [
        { label: 'Sick Leave', text: 'sick' },
        { label: 'Casual Leave', text: 'casual' },
        { label: 'Earned Leave', text: 'earned' },
        { label: 'Unpaid Leave', text: 'unpaid' }
      ]
    }
    if (step === 'awaiting_confirm') {
      return [
        { label: 'Yes, Submit ✅', text: 'Yes' },
        { label: 'Cancel ❌', text: 'No' }
      ]
    }
    return []
  }

  const suggestions = getSuggestions()

  if (suggestions.length === 0) return null

  return (
    <div
      style={{
        padding: '8px 16px',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        overflowX: 'auto',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}
    >
      {suggestions.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => handleSend(chip.text)}
          style={{
            padding: '6px 12px',
            borderRadius: 100,
            background: 'var(--accent-glow)',
            border: '1px solid var(--border)',
            color: 'var(--accent)',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent)'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent-glow)'
            e.currentTarget.style.color = 'var(--accent)'
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.transform = 'none'
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
