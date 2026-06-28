/* Two-column auth scaffold: dark hero panel (left) + form slot (right). */
import type { ReactNode } from 'react'
import Logo from './Logo'
import LandlyMap from '@/components/map/LandlyMap'

interface AuthSplitLayoutProps {
  eyebrow: string
  title: ReactNode
  subtitle: string
  titleSize?: number
  /** Optional extra content under the subtitle (e.g. a stat card). */
  aside?: ReactNode
  /** Right column (caller supplies its own <form>/<div>). */
  children: ReactNode
}

export default function AuthSplitLayout({
  eyebrow,
  title,
  subtitle,
  titleSize = 58,
  aside,
  children,
}: AuthSplitLayoutProps) {
  return (
    <div className="grid relative md:grid-cols-2" style={{ height: '100dvh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* left dark hero — hidden on mobile */}
      <div className="hidden md:flex flex-col text-white relative" style={{ background: 'var(--ink-1)', padding: '56px 56px 0 56px', overflow: 'hidden' }}>
        <Logo size={28} wordColor="#fff" />
        <div style={{ marginTop: 84, maxWidth: 480, position: 'relative', zIndex: 2 }}>
          <div className="l-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{eyebrow}</div>
          <h2 className="l-display" style={{ fontSize: titleSize, color: '#fff', margin: '16px 0 18px 0', fontWeight: 400, lineHeight: 1.05 }}>
            {title}
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: 'rgba(255,255,255,0.65)', maxWidth: 420 }}>{subtitle}</p>
        </div>
        {aside && <div style={{ position: 'relative', zIndex: 2, marginTop: 28 }}>{aside}</div>}
        <div
          className="absolute"
          style={{ left: -40, right: -40, bottom: -190, height: 450, opacity: 0.19, maskImage: 'linear-gradient(to top, black 0%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 90%)', zIndex: 1 }}
        >
          <LandlyMap showControls={false} interactive={false} />
        </div>
      </div>

      {/* Mobile-only compact header — logo + eyebrow pill */}
      <div
        className="md:hidden flex items-center"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 56, padding: '0 16px', zIndex: 10,
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--bg)',
        }}
      >
        <Logo size={22} />
        <span className="l-label" style={{ marginLeft: 12, color: 'var(--ink-3)' }}>{eyebrow}</span>
      </div>

      {/* Form panel — full width on mobile, right half on md+ */}
      <div className="col-start-1 md:col-start-2" style={{ paddingTop: 56 }}>
        {children}
      </div>
    </div>
  )
}
