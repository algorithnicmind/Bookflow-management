'use client'

/**
 * Owner Contacts Page
 * -------------------
 * A CRM-like view for the Platform Owner to manage communications with tenant admins.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { formatDateTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { contactApi } from '@/services/api'
import Card from '@/components/ui/Card'
import AppleEmoji from '@/components/AppleEmoji'
import { SkeletonCard } from '@/components/ui/Skeleton'

export default function OwnerContactsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Restrict to Platform Owner only
  useEffect(() => {
    if (user && user.department !== 'System') {
      router.push('/dashboard')
    }
  }, [user, router])

  const fetchMessages = async (signal) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await contactApi.list(signal)
      setMessages(data)
    } catch (err) {
      setError(err.message || 'Failed to load contact messages.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.department !== 'System') return
    const controller = new AbortController()
    fetchMessages(controller.signal)
    return () => controller.abort()
  }, [user])

  if (user?.department !== 'System') return null

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Contact Messages</h1>
          <p className="page-subtitle">Review messages submitted through the public contact form</p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Failed to load messages</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{error}</p>
            <button 
              onClick={fetchMessages} 
              style={{ marginTop: 16, padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </Card>
      ) : messages.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}><AppleEmoji char="📭" /></div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No messages found</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              No one has submitted a contact form yet.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg) => (
            <Card key={msg.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} style={{ fontSize: '0.9rem', color: 'var(--accent)', textDecoration: 'none' }}>
                    {msg.email}
                  </a>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formatDateTime(msg.created_at)}
                </div>
              </div>
              <div style={{ 
                background: 'var(--bg-secondary)', 
                padding: '16px', 
                borderRadius: '8px',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.message}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
