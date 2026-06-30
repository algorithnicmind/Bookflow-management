'use client'

import { motion } from 'motion/react'
import AppleEmoji from '@/components/AppleEmoji'

export default function SolutionsSection() {
  return (
    <section id="solutions" style={{ display: 'flex', minHeight: '600px', width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', position: 'relative', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', zIndex: 2 }}>
        <div style={{ maxWidth: '500px' }}>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <div style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--accent)', color: '#fff', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '24px' }}>
              BUILT FOR SCALE
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1, color: 'var(--text-main)' }}>
              Solutions tailored for you.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.6 }}>
              Whether you're a fast-moving startup or a global enterprise, LeaveFlow scales perfectly with your needs to automate HR entirely.
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', height: '600px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, var(--bg-secondary) 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />

        <motion.div 
          animate={{ y: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '40px', width: '80%', maxWidth: '500px' }}
        >
          {[
            { title: 'For HR Teams', desc: 'Automate compliance, eliminate manual data entry, and generate audit-ready reports instantly without the spreadsheets.', icon: '👥' },
            { title: 'For Managers', desc: 'Review and approve requests in one click without ever leaving your inbox, Slack, or Microsoft Teams.', icon: '⚡' },
            { title: 'For Employees', desc: 'Check balances, request time off, and plan holidays seamlessly from any device, anywhere in the world.', icon: '📱' },
            { title: 'For HR Teams', desc: 'Automate compliance, eliminate manual data entry, and generate audit-ready reports instantly without the spreadsheets.', icon: '👥' },
            { title: 'For Managers', desc: 'Review and approve requests in one click without ever leaving your inbox, Slack, or Microsoft Teams.', icon: '⚡' },
            { title: 'For Employees', desc: 'Check balances, request time off, and plan holidays seamlessly from any device, anywhere in the world.', icon: '📱' }
          ].map((sol, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  background: 'var(--bg-secondary)', 
                  width: '64px', height: '64px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  borderRadius: '16px', 
                  border: '1px solid var(--border)' 
                }}>
                  <AppleEmoji char={sol.icon} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{sol.title}</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.1rem' }}>{sol.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          #solutions { flex-direction: column !important; min-height: 800px !important; }
          #solutions > div:first-child { padding: 40px 20px !important; flex: none !important; height: auto !important; }
          #solutions > div:last-child { width: 100% !important; }
          #solutions > div:last-child > div:last-child { width: 90% !important; }
        }
      `}} />
    </section>
  )
}
