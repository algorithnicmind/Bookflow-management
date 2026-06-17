'use client'

import { useState, useEffect, useRef } from 'react'
import { botApi } from '@/services/api'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am your AI HR Assistant. You can ask me to check your leave balances, view your recent leave history, query company policies, or apply for leaves conversationally.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [sessionState, setSessionState] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)
    }
  }, [messages, isTyping, isOpen])

  const handleSend = async (textToSend) => {
    const messageText = textToSend || inputValue
    if (!messageText.trim()) return

    // Add user message
    const userMessage = {
      text: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await botApi.chat(messageText, sessionState)
      
      // Simulate slight thinking delay for natural feel
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: response.reply,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
        setSessionState(response.session_state)
        setIsTyping(false)

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1)
        }
      }, 700)
    } catch (error) {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.message || 'Unable to connect to assistant.'}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  // Suggestion chips configurations
  const getSuggestions = () => {
    if (!sessionState || !sessionState.step) {
      return [
        { label: '📊 Check Balances', text: 'What is my leave balance?' },
        { label: '📜 Sick Leave Policy', text: 'What is the sick leave policy?' },
        { label: '✈️ Apply for Leave', text: 'I want to apply for leave' }
      ]
    }
    
    // Custom chips based on state machine step
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

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Floating Action Button */}
      {!isOpen && (
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
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="glass"
          style={{
            width: 380,
            height: 520,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            transformOrigin: 'bottom right',
            background: 'rgba(15, 17, 35, 0.95)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.15))',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10a9.96 9.96 0 0 0 6.368-2.296l3.338 1.113a1 1 0 0 0 1.264-1.264l-1.113-3.338A9.96 9.96 0 0 0 22 12a10 10 0 0 0-10-10zM12 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 8h6v2H9v-2zm1-5h4v2h-4V9z"/>
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>HR Assistant</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Online</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                borderRadius: '50%',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = 'var(--text-main)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages List Area */}
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
                      color: '#fff',
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

            {/* Bouncing Typing Indicator */}
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

          {/* Suggestion Chips */}
          {suggestions.length > 0 && (
            <div
              style={{
                padding: '8px 16px',
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                overflowX: 'auto',
                borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                background: 'rgba(10, 11, 20, 0.4)'
              }}
            >
              {suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.text)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 100,
                    background: 'rgba(79, 70, 229, 0.1)',
                    border: '1px solid rgba(79, 70, 229, 0.3)',
                    color: '#a5b4fc',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)'
                    e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.6)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Box Footer */}
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

          <style jsx>{`
            @keyframes slideUp {
              from { opacity: 0; transform: scale(0.9) translateY(20px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
