'use client'
import { useState } from 'react'

import AuthGuard from '@/features/auth/AuthGuard'
import { NotificationProvider } from '@/context/NotificationContext'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import Chatbot from '@/components/Chatbot/Chatbot'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthGuard>
      <NotificationProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }} className="main-content">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </div>
        <Chatbot />
        <style jsx global>{`
          @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .main-content { margin-left: 0 !important; }
            .mobile-menu-btn { display: flex !important; }
            .sidebar-overlay { display: block !important; }
          }
        `}</style>
      </div>
    </NotificationProvider>
    </AuthGuard>
  )
}
