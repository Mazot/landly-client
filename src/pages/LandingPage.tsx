/* Landing (/) — product-leaning: corridor quick-start + live map preview. */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCorridor } from '@/hooks/useCorridor'
import { useDisplayOrgs } from '@/hooks/useDisplayOrgs'
import { flagOf } from '@/lib/countries'
import { TYPE_META, type OrgTypeKey } from '@/lib/orgTypes'
import type { Country } from '@/types/api'
import Logo from '@/components/ui/Logo'
import Avatar from '@/components/ui/Avatar'
import TypeChip from '@/components/ui/TypeChip'
import CorridorBubble from '@/components/ui/CorridorBubble'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import LandlyMap, { type MapMarker } from '@/components/map/LandlyMap'

const LEGEND: OrgTypeKey[] = ['embassy', 'community', 'business', 'helper', 'volunteer']

export default function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { from, to, toId } = useCorridor()
  const { items, total } = useDisplayOrgs({ location_country_id: toId ?? undefined, limit: 30 })

  const markers: MapMarker[] = useMemo(
    () => items.filter((o) => o.coord).map((o) => ({ id: o.id, coord: o.coord!, type: o.typeKey, name: o.name })),
    [items]
  )
  const featured = items[0]

  const Selector = ({ country }: { country?: Country }) => (
    <button
      onClick={() => navigate('/map')}
      className="flex items-center"
      style={{
        flex: 1,
        height: 48,
        borderRadius: 10,
        border: '1px solid var(--border-2)',
        background: 'var(--surface-2)',
        gap: 9,
        padding: '0 12px',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 18 }}>{flagOf(country)}</span>
      <span style={{ font: '600 14px/1 var(--font-sans)' }}>{country?.name ?? '—'}</span>
      <Icon name="chevronDown" size={14} style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
    </button>
  )

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* top bar */}
      <div
        className="flex items-center"
        style={{ height: 64, padding: '0 40px', borderBottom: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
      >
        <Logo size={28} />
        <nav className="flex" style={{ gap: 4, marginLeft: 32 }}>
          {(['howItWorks', 'forHelpers', 'countries'] as const).map((n) => (
            <span key={n} style={{ font: '600 13.5px/1 var(--font-sans)', padding: '8px 12px', borderRadius: 8, color: 'var(--ink-3)' }}>{t(`landing.nav.${n}`)}</span>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" style={{ marginRight: 8 }} onClick={() => navigate('/login')}>{t('landing.signIn')}</Button>
        <Button variant="accent" size="sm" onClick={() => navigate('/signup')}>
          {t('landing.getStarted')} <Icon name="arrowRight" size={13} stroke={2} />
        </Button>
      </div>

      {/* hero */}
      <div className="grid" style={{ flex: 1, gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
        {/* left — entry */}
        <div className="flex flex-col justify-center" style={{ padding: '64px 56px', maxWidth: 640 }}>
          <span className="l-pill accent" style={{ alignSelf: 'flex-start' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} /> {t('landing.badge')}
          </span>
          <h1 className="l-display" style={{ fontSize: 72, margin: '20px 0 18px 0', fontWeight: 400 }}>
            {t('landing.heroLine1')}<br /><em>{t('landing.heroLine2')}</em>
          </h1>
          <p style={{ font: '400 17px/1.6 var(--font-sans)', color: 'var(--ink-2)', maxWidth: 480, margin: 0 }}>
            {t('landing.subtitle')}
          </p>

          {/* corridor quick-start */}
          <div className="l-card" style={{ marginTop: 32, padding: 18, maxWidth: 520, boxShadow: 'var(--shadow-2)' }}>
            <div className="l-label" style={{ marginBottom: 10 }}>{t('landing.openMapLabel')}</div>
            <div className="flex items-center" style={{ gap: 10 }}>
              <Selector country={from} />
              <Icon name="arrowRight" size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <Selector country={to} />
              <Button variant="accent" style={{ height: 48, flexShrink: 0 }} onClick={() => navigate('/map')} aria-label={t('landing.openMapAria')}>
                <Icon name="arrowRight" size={16} stroke={2} />
              </Button>
            </div>
            <div className="flex items-center" style={{ gap: 8, marginTop: 12, font: '500 12.5px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
              <Icon name="search" size={13} /> {t('landing.browseHint')}
            </div>
          </div>

          {/* type legend */}
          <div className="flex" style={{ gap: 18, marginTop: 28 }}>
            {LEGEND.map((type) => (
              <div key={type} className="flex items-center" style={{ gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: TYPE_META[type].dot }} />
                <span style={{ font: '500 12.5px/1 var(--font-sans)', color: 'var(--ink-2)' }}>{t(`orgType.${type}`)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* right — live map preview */}
        <div className="relative" style={{ overflow: 'hidden', borderLeft: '1px solid var(--border-1)', background: 'var(--country-water)' }}>
          <LandlyMap markers={markers} fitToMarkers showControls={false} interactive={false} />

          <div className="absolute" style={{ top: 20, right: 20 }}>
            <CorridorBubble fromFlag={from?.flag} toFlag={to?.flag} places={total} onView={() => navigate('/map')} />
          </div>

          {featured && (
            <div className="l-card absolute" style={{ bottom: 24, left: 24, width: 320, padding: 16, boxShadow: 'var(--shadow-3)' }}>
              <div className="flex" style={{ gap: 12 }}>
                <Avatar initials={featured.initials} color={featured.typeColor} size={46} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <span style={{ font: '600 14.5px/1.2 var(--font-sans)' }}>{featured.name}</span>
                  </div>
                  <div className="flex items-center" style={{ gap: 7, marginTop: 7 }}>
                    <TypeChip type={featured.typeKey} label={featured.typeLabel} soft />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
