'use client'

export default function MessageList({ messages, isTyping, messagesEndRef }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end',
            gap: 8,
            maxWidth: '85%',
            alignSelf: msg.isUser ? 'flex-end' : 'flex-start'
          }}
        >
          {!msg.isUser && (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                flexShrink: 0,
                border: '1px solid var(--border)'
              }}
            >
              🤖
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: msg.isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                background: msg.isUser ? 'linear-gradient(135deg, #4f46e5, #4338ca)' : 'var(--bg-tertiary)',
                color: msg.isUser ? '#fff' : 'var(--text-main)',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                boxShadow: 'var(--shadow-sm)',
                border: msg.isUser ? 'none' : '1px solid var(--border)'
              }}
            >
              {msg.text}
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                padding: '0 4px'
              }}
            >
              {msg.timestamp}
            </span>
          </div>
        </div>
      ))}

      {isTyping && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: '85%', alignSelf: 'flex-start' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🤖</div>
          <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 2px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', display: 'flex', gap: 4 }}>
            <div className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1s infinite' }} />
            <div className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1s infinite 0.2s' }} />
            <div className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce 1s infinite 0.4s' }} />
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}
