'use client'

import { motion } from 'motion/react'
import AppleEmoji from '@/components/AppleEmoji'

export default function HeroSection({ platformConfig }) {
  return (
    <section style={{ position: 'relative', width: '100%', overflow: 'hidden', paddingBottom: '60px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '180px 24px 60px',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <motion.div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 100,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            fontWeight: 600,
            marginBottom: 32,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}>
            <AppleEmoji char="✨" /> Welcome to the Future of Work
          </motion.div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: 24,
            whiteSpace: 'nowrap'
          }}>
            Breathe Easy.<br/>
            
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {[
                { top: '-10%', left: '-5%', delay: 0, color: '#10b981', size: 30 },
                { top: '80%', left: '10%', delay: 0.5, color: '#3b82f6', size: 20 },
                { top: '-5%', left: '50%', delay: 1.2, color: '#f59e0b', size: 24 },
                { top: '90%', left: '60%', delay: 0.8, color: '#10b981', size: 16 },
                { top: '10%', left: '95%', delay: 0.3, color: '#8b5cf6', size: 28 },
                { top: '85%', left: '90%', delay: 1.5, color: '#3b82f6', size: 22 },
              ].map((sparkle, i) => (
                <motion.svg key={i} width={sparkle.size} height={sparkle.size} viewBox="0 0 24 24" fill="none"
                  animate={{ scale: [0, 1, 0], rotate: [0, 180], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: sparkle.delay, ease: "easeInOut" }}
                  style={{ 
                    position: 'absolute', 
                    top: sparkle.top, 
                    left: sparkle.left, 
                    color: sparkle.color,
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor" />
                </motion.svg>
              ))}

              <motion.span 
                animate={{ backgroundPosition: ['200% center', '-200% center'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ 
                  display: 'inline-block',
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 25%, #ffffff 50%, #34d399 75%, #10b981 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0px 8px 16px rgba(16, 185, 129, 0.25))'
                }}
              >
                Automate Your Time Off.
              </motion.span>
            </div>
          </h1>

          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
            color: 'var(--text-muted)',
            maxWidth: 720,
            lineHeight: 1.6,
            marginBottom: 48,
          }}>
            The ultimate time-off management platform designed for modern teams. Say goodbye to messy spreadsheets and endless email chains.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (platformConfig.show_onboarding_section) {
                  document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              style={{
                background: 'var(--accent)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Get Started Now <AppleEmoji char="🚀" />
            </button>
            <button
              onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                padding: '16px 32px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1.1rem',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              View Solutions
            </button>
          </div>
        </motion.div>
      </motion.div>

      <div style={{ marginTop: '80px', width: '100%', overflow: 'hidden', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          style={{ display: 'flex', gap: '80px', whiteSpace: 'nowrap', width: 'fit-content' }}
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '80px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><AppleEmoji char="⚡" /> Lightning Fast</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><AppleEmoji char="🔒" /> Enterprise Secure</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><AppleEmoji char="🤖" /> AI Powered</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
