'use client'

import { motion } from 'motion/react'
import AppleEmoji from '@/components/AppleEmoji'

export default function FeatureGrid() {
  return (
    <section id="features" style={{ padding: '80px 32px 120px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, type: 'spring' }}
        style={{ textAlign: 'center', marginBottom: 60 }}
      >
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Everything you need.</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Powerful tools disguised in a simple, intuitive interface.</p>
      </motion.div>

      <div style={{ position: 'relative', overflow: 'hidden', padding: '20px 0', width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          style={{ display: 'flex', gap: '24px', width: 'fit-content', paddingLeft: '24px', marginBottom: '24px' }}
        >
          {[
            { icon: <AppleEmoji char="✨" />, title: 'Frictionless Requests', desc: 'Apply for time off in seconds. Real-time balance calculations ensure zero errors.' },
            { icon: <AppleEmoji char="⚡" />, title: '1-Click Approvals', desc: 'Managers can approve or deny requests directly from email or their dashboard instantly.' },
            { icon: <AppleEmoji char="📅" />, title: 'Global Holidays', desc: 'Automatically import regional public holidays tailored to your employee locations.' },
            { icon: <AppleEmoji char="✨" />, title: 'Frictionless Requests', desc: 'Apply for time off in seconds. Real-time balance calculations ensure zero errors.' },
            { icon: <AppleEmoji char="⚡" />, title: '1-Click Approvals', desc: 'Managers can approve or deny requests directly from email or their dashboard instantly.' },
            { icon: <AppleEmoji char="📅" />, title: 'Global Holidays', desc: 'Automatically import regional public holidays tailored to your employee locations.' },
          ].map((feature, i) => (
            <div key={`top-${i}`} style={{
              minWidth: '400px',
              padding: '40px 32px',
              borderRadius: '24px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', gap: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--accent), #3b82f6)', opacity: 0.8 }} />
              <div style={{ fontSize: '2.5rem', background: 'rgba(16, 185, 129, 0.1)', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                {feature.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>{feature.title}</h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div 
          animate={{ x: ["-50%", "0%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          style={{ display: 'flex', gap: '24px', width: 'fit-content', paddingLeft: '24px' }}
        >
          {[
            { icon: <AppleEmoji char="🛡️" />, title: 'Audit Ready', desc: 'Comprehensive, tamper-proof logs for HR compliance and seamless annual reporting.' },
            { icon: <AppleEmoji char="⚙️" />, title: 'Custom Workflows', desc: 'Multi-tiered approval chains. Route leaves to HR, Managers, or both seamlessly.' },
            { icon: <AppleEmoji char="📱" />, title: 'Anywhere Access', desc: 'Fully responsive design allows you to manage leaves from desktop, tablet, or phone.' },
            { icon: <AppleEmoji char="🛡️" />, title: 'Audit Ready', desc: 'Comprehensive, tamper-proof logs for HR compliance and seamless annual reporting.' },
            { icon: <AppleEmoji char="⚙️" />, title: 'Custom Workflows', desc: 'Multi-tiered approval chains. Route leaves to HR, Managers, or both seamlessly.' },
            { icon: <AppleEmoji char="📱" />, title: 'Anywhere Access', desc: 'Fully responsive design allows you to manage leaves from desktop, tablet, or phone.' },
          ].map((feature, i) => (
            <div key={`bottom-${i}`} style={{
              minWidth: '400px',
              padding: '40px 32px',
              borderRadius: '24px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', gap: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3b82f6, var(--accent))', opacity: 0.8 }} />
              <div style={{ fontSize: '2.5rem', background: 'rgba(59, 130, 246, 0.1)', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                {feature.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>{feature.title}</h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
