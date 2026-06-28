/* Countries (/countries) — corridor cards + country catalogue. Responsive via Tailwind. */
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
import MobileBottomNav from '@/components/mobile/MobileBottomNav'

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
    <div className="flex flex-col" style={{ height: '100dvh', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar />

      {/* Scrollable body — padding scales with breakpoint */}
      <div className="l-scroll flex-1 overflow-auto px-4 py-5 md:px-14 md:py-9 xl:px-[56px] xl:py-[36px]">
        <SectionHeading
          eyebrow={t('countries.forYou')}
          title={t('countries.yourCorridors')}
          aside={
            <span style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
              {t('countries.switchHint')}
            </span>
          }
        />

        {/* Corridor cards — horizontal scroll */}
        <div className="l-scroll flex mt-4 pb-1" style={{ gap: 12, overflowX: 'auto' }}>
          {/* Active corridor card — 215px mobile, 280px tablet+ */}
          <div
            className="flex-shrink-0"
            style={{
              width: 'clamp(215px, 50vw, 280px)',
              border: '1px solid var(--ink-1)',
              borderRadius: 16,
              background: 'var(--surface)',
              padding: 16,
              boxShadow: 'var(--shadow-2)',
            }}
          >
            <div className="flex items-center" style={{ gap: 10 }}>
              <FlagPair fromFlag={flagOf(from)} toFlag={flagOf(to)} size={20} gap={8} arrowSize={13} arrowColor="var(--accent)" />
              <span style={{ marginLeft: 'auto' }}><Badge tone="accent">{t('countries.active')}</Badge></span>
            </div>
            <div style={{ font: '600 14px/1.2 var(--font-sans)', marginTop: 12 }}>
              {from?.name ?? '—'} → {to?.name ?? '—'}
            </div>
            <Button variant="ghost" size="sm" fullWidth style={{ marginTop: 12 }} onClick={() => navigate('/map')}>
              {t('countries.openMap')} <Icon name="arrowRight" size={13} stroke={2} />
            </Button>
          </div>

          {/* Add corridor button */}
          <button
            className="flex flex-col items-center justify-center flex-shrink-0"
            style={{ width: 160, minHeight: 100, borderRadius: 16, border: '1.5px dashed var(--border-2)', background: 'var(--surface-2)', gap: 8, color: 'var(--ink-3)', cursor: 'pointer' }}
          >
            <span
              className="flex items-center justify-center"
              style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-1)' }}
            >
              <Icon name="plus" size={17} />
            </span>
            <span style={{ font: '600 12.5px/1.3 var(--font-sans)', textAlign: 'center', padding: '0 8px' }}>
              {t('countries.addCorridor')}
            </span>
          </button>
        </div>

        {/* Browse heading + search */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between"
          style={{ marginTop: 36, gap: 12 }}
        >
          <h3 style={{ font: '600 18px/1 var(--font-sans)', margin: 0 }}>
            {t('countries.browseAll')}
          </h3>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('countries.searchPlaceholder')}
            height={38}
            style={{ width: '100%', maxWidth: 280 }}
          />
        </div>

        {/* Country grid: 1-col mobile, 2-col tablet, 3-col desktop */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          style={{ gap: 10, marginTop: 14, paddingBottom: 24 }}
        >
          {filtered.map((c) => (
            <button
              key={c.id}
              className="l-card flex items-center"
              style={{ padding: '14px 16px', gap: 12, cursor: 'pointer', textAlign: 'left', minHeight: 64 }}
              onClick={() => openCorridor(c.id)}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{flagOf(c)}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ font: '600 14px/1.2 var(--font-sans)' }}>{c.name}</span>
                  {c.id === to?.id && <Badge tone="accent">{t('countries.corridorBadge')}</Badge>}
                </span>
                {c.capitalCity && (
                  <span className="block" style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--ink-3)', marginTop: 5 }}>
                    {c.capitalCity}
                  </span>
                )}
              </span>
              <Icon name="chevronRight" size={15} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  )
}
