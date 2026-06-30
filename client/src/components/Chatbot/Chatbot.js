'use client'

import { useState, useEffect, useRef } from 'react'
import { botApi } from '@/services/api'
import FloatingButton from './FloatingButton'
import ChatbotHeader from './ChatbotHeader'
import MessageList from './MessageList'
import SuggestionChips from './SuggestionChips'
import ChatInput from './ChatInput'

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

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      <FloatingButton isOpen={isOpen} setIsOpen={setIsOpen} unreadCount={unreadCount} />

      {isOpen && (
        <div
          className="glass"
          style={{
            width: 380,
            height: 520,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            transformOrigin: 'bottom right',
            background: 'var(--bg-primary)',
            overflow: 'hidden'
          }}
        >
          <ChatbotHeader setIsOpen={setIsOpen} />
          
          <MessageList 
            messages={messages} 
            isTyping={isTyping} 
            messagesEndRef={messagesEndRef} 
          />

          <SuggestionChips 
            sessionState={sessionState} 
            handleSend={handleSend} 
          />

          <ChatInput 
            inputValue={inputValue} 
            setInputValue={setInputValue} 
            handleSend={handleSend} 
            isTyping={isTyping} 
          />

          <style jsx>{`
            @keyframes slideUp {
              from { opacity: 0; transform: scale(0.9) translateY(20px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @global {
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
              }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
