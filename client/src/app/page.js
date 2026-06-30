'use client'

/**
 * Landing Page
 * ------------
 * The public-facing marketing page. Contains the "Get Started" contact form 
 * which submits data to the backend /api/contact endpoint.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/AuthContext'
import { platformConfigApi } from '@/services/api'
import LeadModal from '@/components/LeadModal'
import OnboardingModal from '@/components/OnboardingModal'

import FloatingNav from '@/components/Landing/FloatingNav'
import HeroSection from '@/components/Landing/HeroSection'
import FeatureGrid from '@/components/Landing/FeatureGrid'
import SolutionsSection from '@/components/Landing/SolutionsSection'
import PricingSection from '@/components/Landing/PricingSection'
import ContactSection from '@/components/Landing/ContactSection'

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('free_trial')
  const [platformConfig, setPlatformConfig] = useState({
    show_onboarding_section: true,
    onboarding_section_title: 'Get Started with LeaveFlow',
    onboarding_section_subtitle: 'Fill out the form below and our team will set up your organization.'
  })

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  useEffect(() => {
    // Fetch platform config (public endpoint)
    platformConfigApi.get()
      .then(config => setPlatformConfig(config))
      .catch(() => {
        // Use defaults if fetch fails
      })
  }, [])

  useEffect(() => {
    if (!loading && user) {
      if (user.department === 'System') {
        router.push('/leads')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, loading, router])

  if (loading || !mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    )
  }

  if (user) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      <FloatingNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        <HeroSection platformConfig={platformConfig} />
        <FeatureGrid />
        <SolutionsSection />
        <PricingSection 
          platformConfig={platformConfig} 
          setSelectedPlan={setSelectedPlan}
          setOnboardingModalOpen={setOnboardingModalOpen}
          setLeadModalOpen={setLeadModalOpen}
        />
        <ContactSection />
      </main>

      <LeadModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
      <OnboardingModal isOpen={onboardingModalOpen} onClose={() => setOnboardingModalOpen(false)} selectedPlan={selectedPlan} />
    </div>
  )
}
