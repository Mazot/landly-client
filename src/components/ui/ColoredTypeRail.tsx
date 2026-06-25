/* Horizontal type filter rail — active type tinted with its colour, "All" tinted ink. */
import { useTranslation } from 'react-i18next'
import { TYPE_META, type OrgTypeKey } from '@/lib/orgTypes'

export type RailKey = 'all' | OrgTypeKey

const ITEMS: RailKey[] = ['all', 'embassy', 'business', 'community', 'helper', 'volunteer']

interface ColoredTypeRailProps {
  active?: RailKey
  onPick?: (t: RailKey) => void
}

export default function ColoredTypeRail({ active = 'all', onPick }: ColoredTypeRailProps) {
  const { t } = useTranslation()
  return (
    <div className="flex" style={{ gap: 7 }}>
      {ITEMS.map((item) => {
        const isActive = item === active
        const label = item === 'all' ? t('map.all') : t(`orgType.${item}`)
        if (item === 'all') {
          return (
            <button
              key={item}
              onClick={() => onPick?.(item)}
              className="inline-flex items-center whitespace-nowrap"
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 999,
                cursor: 'pointer',
                font: '600 12.5px/1 var(--font-sans)',
                letterSpacing: '0.01em',
                background: isActive ? 'var(--ink-1)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--ink-2)',
                border: isActive ? '1px solid var(--ink-1)' : '1px solid var(--border-1)',
              }}
            >
              {label}
            </button>
          )
        }
        const m = TYPE_META[item]
        return (
          <button
            key={item}
            onClick={() => onPick?.(item)}
            className="inline-flex items-center whitespace-nowrap"
            style={{
              gap: 7,
              height: 32,
              padding: '0 13px',
              borderRadius: 999,
              cursor: 'pointer',
              font: '600 12.5px/1 var(--font-sans)',
              letterSpacing: '0.01em',
              background: isActive ? m.soft : 'var(--surface)',
              color: isActive ? m.dot : 'var(--ink-2)',
              border: isActive ? '1px solid transparent' : '1px solid var(--border-1)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: m.dot }} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
