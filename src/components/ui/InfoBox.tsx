import type { CSSProperties, ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

type Tone = 'accent' | 'warning' | 'neutral'

const TONE_STYLES: Record<Tone, { bg: string; border: string; color: string }> = {
  accent:  { bg: 'var(--accent-tint)',   border: 'var(--accent-soft)',  color: 'var(--accent-hover)' },
  warning: { bg: 'rgba(220,100,30,0.08)', border: 'rgba(220,100,30,0.2)', color: 'var(--type-business)' },
  neutral: { bg: 'var(--surface-2)',      border: 'var(--border-1)',       color: 'var(--ink-3)' },
}

interface InfoBoxProps {
  icon: IconName
  tone?: Tone
  children: ReactNode
  style?: CSSProperties
}

export default function InfoBox({ icon, tone = 'accent', children, style }: InfoBoxProps) {
  const s = TONE_STYLES[tone]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '9px 14px',
        background: s.bg,
        borderBottom: `1px solid ${s.border}`,
        ...style,
      }}
    >
      <Icon name={icon} size={13} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
      <span style={{ font: '500 11.5px/1.4 var(--font-sans)', color: s.color }}>{children}</span>
    </div>
  )
}
