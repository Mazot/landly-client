import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Country } from '@/types/api'
import { flagOf } from '@/lib/countries'
import Icon from '@/components/ui/Icon'

interface CountryPickerProps {
  title: string
  countries: Country[]
  selectedId?: string
  onSelect: (id: string) => void
  onClose: () => void
}

export default function CountryPicker({ title, countries, selectedId, onSelect, onClose }: CountryPickerProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = query.trim()
    ? countries.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    : countries

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(20,18,14,0.40)',
        display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          margin: '0 auto',
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '82dvh',
          boxShadow: '0 -8px 40px rgba(20,18,14,0.18)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-2)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '8px 16px 12px' }}>
          <span style={{ font: '600 16px/1 var(--font-sans)', color: 'var(--ink-1)' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border-1)',
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--ink-3)',
            }}
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('landing.searchCountry', 'Search country…')}
              className="l-input"
              style={{ paddingLeft: 36, height: 40, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Country list */}
        <div className="l-scroll" style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
              {t('landing.noCountries', 'No countries found')}
            </div>
          )}
          {filtered.map((c) => {
            const active = c.id === selectedId
            return (
              <button
                key={c.id}
                onClick={() => { onSelect(c.id); onClose() }}
                className="flex items-center"
                style={{
                  width: '100%', padding: '11px 16px', gap: 12,
                  background: active ? 'var(--accent-tint)' : 'transparent',
                  border: 0, cursor: 'pointer', textAlign: 'left',
                  borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{flagOf(c)}</span>
                <span style={{
                  font: `${active ? 600 : 500} 14px/1 var(--font-sans)`,
                  color: active ? 'var(--accent)' : 'var(--ink-1)',
                  flex: 1,
                }}>
                  {c.name}
                </span>
                {active && <Icon name="check" size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
