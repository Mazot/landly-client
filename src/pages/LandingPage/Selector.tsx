import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Country } from '@/types/api'
import Icon from '@/components/ui/Icon'
import { flagOf } from '@/lib/countries'
import CountryPicker from '@/components/ui/CountryPicker'

interface SelectorProps {
  country?: Country
  countries: Country[]
  onSelect: (id: string) => void
  title: string
}

export default function Selector({ country, countries, onSelect, title }: SelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center"
        style={{
          flex: 1, height: 48, borderRadius: 10,
          border: '1px solid var(--border-2)',
          background: 'var(--surface-2)',
          gap: 9, padding: '0 12px',
          cursor: 'pointer', minWidth: 0,
        }}
      >
        <span style={{ fontSize: 18 }}>{flagOf(country)}</span>
        <span style={{ font: '600 14px/1 var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {country?.name ?? '—'}
        </span>
        <Icon name="chevronDown" size={14} style={{ marginLeft: 'auto', color: 'var(--ink-3)', flexShrink: 0 }} />
      </button>

      {open && createPortal(
        <CountryPicker
          title={title}
          countries={countries}
          selectedId={country?.id}
          onSelect={onSelect}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  )
}
