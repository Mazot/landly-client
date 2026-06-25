/* Big from→to corridor selector (used in signup). Reads/writes the corridor store. */
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { flagOf } from '@/lib/countries'
import { useCorridor } from '@/hooks/useCorridor'
import { useClickOutside } from '@/hooks/useClickOutside'
import type { Country } from '@/types/api'
import Icon from './Icon'

function CountryMenu({ countries, onPick }: { countries: Country[]; onPick: (id: string) => void }) {
  return (
    <div
      className="l-card l-scroll absolute z-30"
      style={{
        top: 'calc(100% + 6px)',
        left: 0,
        right: 0,
        maxHeight: 240,
        overflow: 'auto',
        boxShadow: 'var(--shadow-pop)',
        padding: 6,
      }}
    >
      {countries.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c.id)}
          className="flex items-center w-full"
          style={{
            gap: 10,
            padding: '8px 10px',
            borderRadius: 8,
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            font: '600 13.5px/1 var(--font-sans)',
            color: 'var(--ink-1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{ fontSize: 18 }}>{flagOf(c)}</span>
          {c.name}
        </button>
      ))}
    </div>
  )
}

export default function CorridorPicker() {
  const { t } = useTranslation()
  const { from, to, fromId, toId, setCorridor, countries } = useCorridor()
  const [open, setOpen] = useState<'from' | 'to' | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  useClickOutside(rootRef, () => setOpen(null), open !== null)

  const Side = ({
    side,
    label,
    sub,
    country,
  }: {
    side: 'from' | 'to'
    label: string
    sub: string
    country?: Country
  }) => (
    <div className="flex-1 relative">
      <div className="l-label" style={{ marginBottom: 8 }}>{label}</div>
      <button
        onClick={() => setOpen(open === side ? null : side)}
        className="flex items-center w-full"
        style={{
          height: 56,
          borderRadius: 12,
          border: '1px solid var(--ink-1)',
          background: 'var(--surface)',
          padding: '0 14px',
          gap: 11,
          boxShadow: '0 0 0 4px rgba(27,26,23,0.06)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 22 }}>{flagOf(country)}</span>
        <span style={{ minWidth: 0 }}>
          <span className="block" style={{ font: '600 15px/1.1 var(--font-sans)', color: 'var(--ink-1)' }}>
            {country?.name ?? '—'}
          </span>
          <span className="block" style={{ font: '500 11.5px/1 var(--font-sans)', color: 'var(--ink-3)', marginTop: 3 }}>
            {sub}
          </span>
        </span>
        <Icon name="chevronDown" size={16} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
      </button>
      {open === side && (
        <CountryMenu
          countries={countries}
          onPick={(id) => {
            if (side === 'from') setCorridor(id, toId ?? id)
            else setCorridor(fromId ?? id, id)
            setOpen(null)
          }}
        />
      )}
    </div>
  )

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex items-end" style={{ gap: 14 }}>
        <Side side="from" label={t('corridorPicker.imFrom')} sub={t('corridorPicker.fromSub')} country={from} />
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 56 }}>
          <span
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: 'var(--accent-tint)',
              color: 'var(--accent-hover)',
            }}
          >
            <Icon name="arrowRight" size={16} stroke={2.2} />
          </span>
        </div>
        <Side side="to" label={t('corridorPicker.headingTo')} sub={t('corridorPicker.toSub')} country={to} />
      </div>
    </div>
  )
}
