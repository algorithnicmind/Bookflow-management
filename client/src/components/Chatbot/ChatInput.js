'use client'

export default function ChatInput({ inputValue, setInputValue, handleSend, isTyping }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div
      style={{
        padding: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--bg-secondary)'
      }}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Ask anything about leave balances or policies..."
        disabled={isTyping}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem'
        }}
      />
      <button
        onClick={() => handleSend()}
        disabled={isTyping || !inputValue.trim()}
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-sm)',
          background: inputValue.trim() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'var(--border)',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: inputValue.trim() ? 'pointer' : 'default',
          transition: 'var(--transition)',
          opacity: inputValue.trim() ? 1 : 0.5
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  )
}
