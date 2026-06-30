'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { settingsApi } from '@/services/api'

export default function OrganizationBadge() {
  const { user } = useAuth()
  const [isEditingOrgName, setIsEditingOrgName] = useState(false)
  const [orgNameInput, setOrgNameInput] = useState('')
  const [isSavingOrgName, setIsSavingOrgName] = useState(false)

  const handleOrgNameSave = async () => {
    if (!orgNameInput.trim() || orgNameInput === user?.organization_name) {
      setIsEditingOrgName(false)
      return
    }
    try {
      setIsSavingOrgName(true)
      await settingsApi.updateOrganizationName(orgNameInput.trim())
      // Reload window to instantly apply the name change globally in AuthContext
      window.location.reload()
    } catch (err) {
      console.error('Failed to update organization name:', err)
      setIsEditingOrgName(false)
    } finally {
      setIsSavingOrgName(false)
    }
  }

  return (
    <div 
      onClick={() => {
        if (user?.role === 'super_admin') {
          setOrgNameInput(user?.organization_name || '')
          setIsEditingOrgName(true)
        }
      }}
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        cursor: user?.role === 'super_admin' ? 'pointer' : 'default',
        transition: 'var(--transition)',
      }}
      title={user?.role === 'super_admin' ? "Click to edit company name" : ""}
      onMouseEnter={(e) => {
        if (user?.role === 'super_admin') {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (user?.role === 'super_admin') {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'
        }
      }}
    >
      <div style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '0.65rem'
      }}>
        🏢
      </div>
      
      {isEditingOrgName ? (
        <input
          autoFocus
          value={orgNameInput}
          onChange={(e) => setOrgNameInput(e.target.value)}
          disabled={isSavingOrgName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleOrgNameSave()
            if (e.key === 'Escape') setIsEditingOrgName(false)
          }}
          onBlur={handleOrgNameSave}
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: `${Math.max(120, orgNameInput.length * 8)}px`,
            padding: 0,
            margin: 0
          }}
        />
      ) : (
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          letterSpacing: '0.2px',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {user?.organization_name || (user?.department === 'System' ? 'Platform Owner' : 'LeaveFlow')}
          {user?.role === 'super_admin' && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7 }}>✎</span>
          )}
        </span>
      )}
    </div>
  )
}
