import type { CSSProperties } from 'react'

interface Tab {
  key: string
  label: string
}

interface TabBarProps {
  tabs: Tab[]
  activeKey: string
  onChange: (key: string) => void
  scrollable?: boolean
  style?: CSSProperties
}

export default function TabBar({ tabs, activeKey, onChange, scrollable = true, style }: TabBarProps) {
  return (
    <div
      role="tablist"
      className="flex"
      style={{
        overflowX: scrollable ? 'auto' : undefined,
        scrollbarWidth: 'none',
        borderTop: '1px solid var(--border-1)',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            style={{
              flexShrink: 0,
              padding: '10px 14px',
              minHeight: 44,
              font: '600 13px/1 var(--font-sans)',
              color: active ? 'var(--ink-1)' : 'var(--ink-3)',
              background: 'transparent',
              border: 0,
              borderBottom: `2px solid ${active ? 'var(--ink-1)' : 'transparent'}`,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
