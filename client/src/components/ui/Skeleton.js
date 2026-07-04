'use client'

import React from 'react'

/**
 * Skeleton Components
 * -------------------
 * Reusable skeleton loading states to replace traditional spinners.
 */

export function SkeletonBox({ width = '100%', height = '20px', borderRadius = '8px', className = '', style = {} }) {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{ width, height, borderRadius, ...style }}
    />
  )
}

export function SkeletonText({ lines = 3, gap = '12px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          height="16px"
          width={i === lines - 1 ? '60%' : '100%'}
          borderRadius="4px"
        />
      ))}
    </div>
  )
}

export function SkeletonCircle({ size = '40px', className = '', style = {} }) {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, ...style }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card-skeleton" style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
        <SkeletonCircle size="48px" />
        <div style={{ flex: 1 }}>
          <SkeletonBox height="20px" width="50%" style={{ marginBottom: '8px' }} />
          <SkeletonBox height="14px" width="30%" />
        </div>
      </div>
      <SkeletonText lines={2} gap="10px" />
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonBox height="36px" width="100px" borderRadius="8px" />
        <SkeletonBox height="36px" width="100px" borderRadius="8px" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div style={{ width: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', padding: '16px 24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)', gap: '16px' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBox key={i} height="14px" width="100%" borderRadius="4px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', padding: '16px 24px', borderBottom: '1px solid var(--border)', gap: '16px', background: 'var(--bg-secondary)' }}>
          {Array.from({ length: columns }).map((_, c) => (
             <SkeletonBox key={c} height="16px" width={c === 0 ? '70%' : '100%'} borderRadius="4px" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: 'var(--bg-main)' }}>
      {/* Sidebar Skeleton */}
      <div style={{ width: '280px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SkeletonCircle size="32px" />
          <SkeletonBox height="24px" width="120px" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBox key={i} height="36px" width="100%" borderRadius="8px" />
          ))}
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Skeleton */}
        <div style={{ height: '80px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', gap: '16px' }}>
           <SkeletonBox height="36px" width="200px" borderRadius="8px" />
           <SkeletonCircle size="40px" />
        </div>
        {/* Page Content Skeleton */}
        <div style={{ padding: '32px', flex: 1, overflow: 'auto' }}>
           <SkeletonBox height="40px" width="300px" style={{ marginBottom: '8px' }} />
           <SkeletonBox height="20px" width="200px" style={{ marginBottom: '40px' }} />
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
             {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                   <SkeletonBox height="40px" width="40px" style={{ marginBottom: '16px' }} />
                   <SkeletonBox height="32px" width="80px" style={{ marginBottom: '8px' }} />
                   <SkeletonBox height="16px" width="120px" />
                </div>
             ))}
           </div>
           
           <SkeletonTable rows={4} columns={5} />
        </div>
      </div>
    </div>
  )
}
