/* Countries (/countries) — your active corridor + the real country catalogue. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { flagOf } from '@/lib/countries'
import { useCorridor } from '@/hooks/useCorridor'
import TopBar from '@/components/ui/TopBar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import FlagPair from '@/components/ui/FlagPair'
import SearchInput from '@/components/ui/SearchInput'
import SectionHeading from '@/components/ui/SectionHeading'

export default function CountriesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { from, to, fromId, setCorridor, countries } = useCorridor()
  const [search, setSearch] = useState('')

  const openCorridor = (toCountryId: string) => {
    if (fromId) setCorridor(fromId, toCountryId)
    navigate('/map')
  }

  const filtered = countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar />
      <div className="l-scroll" style={{ flex: 1, overflow: 'auto', padding: '36px 56px 56px 56px' }}>
        {/* Your corridor */}
        <SectionHeading
          eyebrow={t('countries.forYou')}
          title={t('countries.yourCorridors')}
          aside={<span style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>{t('countries.switchHint')}</span>}
        />
        <div className="l-scroll flex" style={{ gap: 14, marginTop: 20, overflowX: 'auto', paddingBottom: 4 }}>
          <div
            style={{ width: 280, flexShrink: 0, border: '1px solid var(--ink-1)', borderRadius: 16, background: 'var(--surface)', padding: 18, boxShadow: 'var(--shadow-2)' }}
          >
            <div className="flex items-center" style={{ gap: 10 }}>
              <FlagPair fromFlag={flagOf(from)} toFlag={flagOf(to)} size={22} gap={10} arrowSize={15} arrowColor="var(--accent)" />
              <span style={{ marginLeft: 'auto' }}><Badge tone="accent">{t('countries.active')}</Badge></span>
            </div>
            <div style={{ font: '600 16px/1.2 var(--font-sans)', marginTop: 14 }}>{from?.name ?? '—'} → {to?.name ?? '—'}</div>
            <Button variant="ghost" size="sm" fullWidth style={{ marginTop: 14 }} onClick={() => navigate('/map')}>
              {t('countries.openMap')} <Icon name="arrowRight" size={13} stroke={2} />
            </Button>
          </div>
          <button
            className="flex flex-col items-center justify-center"
            style={{ width: 200, flexShrink: 0, borderRadius: 16, border: '1.5px dashed var(--border-2)', background: 'var(--surface-2)', gap: 10, color: 'var(--ink-3)', cursor: 'pointer' }}
          >
            <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-1)' }}>
              <Icon name="plus" size={18} />
            </span>
            <span style={{ font: '600 13px/1 var(--font-sans)' }}>{t('countries.addCorridor')}</span>
          </button>
        </div>

        {/* Browse countries */}
        <div className="flex items-center justify-between" style={{ marginTop: 44 }}>
          <h3 style={{ font: '600 20px/1 var(--font-sans)', margin: 0 }}>{t('countries.browseAll')}</h3>
          <SearchInput value={search} onChange={setSearch} placeholder={t('countries.searchPlaceholder')} height={38} style={{ width: 280 }} />
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18 }}>
          {filtered.map((c) => (
            <button
              key={c.id}
              className="l-card flex items-center"
              style={{ padding: 18, gap: 14, cursor: 'pointer', textAlign: 'left' }}
              onClick={() => openCorridor(c.id)}
            >
              <span style={{ fontSize: 34, lineHeight: 1 }}>{flagOf(c)}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ font: '600 15.5px/1.2 var(--font-sans)' }}>{c.name}</span>
                  {c.id === to?.id && <Badge tone="accent">{t('countries.corridorBadge')}</Badge>}
                </span>
                {c.capitalCity && (
                  <span className="block" style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--ink-3)', marginTop: 6 }}>{c.capitalCity}</span>
                )}
              </span>
              <Icon name="chevronRight" size={16} style={{ color: 'var(--ink-4)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
