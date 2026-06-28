/**
 * DateSeparator — centred date / topic label between message groups.
 */
import type { ReactNode } from 'react'

interface DateSeparatorProps {
  children: ReactNode
}

export default function DateSeparator({ children }: DateSeparatorProps) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <span
        style={{
          font: '500 11px/1 var(--font-sans)',
          color: 'var(--ink-4)',
          background: 'var(--surface)',
          border: '1px solid var(--border-1)',
          borderRadius: 999,
          padding: '5px 11px',
        }}
      >
        {children}
      </span>
    </div>
  )
}
