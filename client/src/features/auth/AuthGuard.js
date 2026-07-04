'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/AuthContext'
import { SkeletonLayout } from '@/components/ui/Skeleton'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push('/login')
    }
  }, [user, loading, mounted, router])

  if (!mounted || loading) {
    return <SkeletonLayout />
  }

  if (!user) return null

  return children
}
