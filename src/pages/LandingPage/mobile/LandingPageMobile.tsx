import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCorridor } from '@/hooks/useCorridor'
import { useDisplayOrgs } from '@/hooks/useDisplayOrgs'
import { TYPE_META } from '@/lib/orgTypes'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import CorridorBubble from '@/components/ui/CorridorBubble'
import LandlyMap, { type MapMarker } from '@/components/map/LandlyMap'
import Selector from '../Selector'
import { LEGEND } from '../constants'

export default function LandingPageMobile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { from, to, toId, countries, setFrom, setTo } = useCorridor()
  const { items, total } = useDisplayOrgs({ location_country_id: toId ?? undefined, limit: 30 })

  const markers: MapMarker[] = useMemo(
    () => items.filter((o) => o.coord).map((o) => ({ id: o.id, coord: o.coord!, type: o.typeKey, name: o.name })),
    [items]
  )

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div
        className="flex items-center"
        style={{
          height: 56, padding: '0 18px',
          borderBottom: '1px solid var(--border-1)',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(8px)',
          flexShrink: 0,
        }}
      >
        <Logo size={22} />
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" style={{ marginRight: 8 }} onClick={() => navigate('/login')}>
          {t('landing.signIn')}
        </Button>
        <Button variant="accent" size="sm" onClick={() => navigate('/signup')}>
          {t('landing.getStarted')}
        </Button>
      </div>

      {/* Map hero — 210px mobile, 380px tablet */}
      <div
        className="relative overflow-hidden h-[210px] md:h-[380px]"
        style={{ background: 'var(--country-water)', borderBottom: '1px solid var(--border-1)', flexShrink: 0 }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <LandlyMap markers={markers} fitToMarkers showControls={false} interactive={false} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(246,244,239,0.5) 100%)' }} />
        <div className="absolute" style={{ bottom: 12, left: 12 }}>
          <CorridorBubble fromFlag={from?.flag} toFlag={to?.flag} places={total} onView={() => navigate('/map')} />
        </div>
      </div>

      {/* Content — single col mobile, 2-col tablet */}
      <div className="l-scroll flex-1 overflow-auto" style={{ padding: '22px 18px 40px' }}>
        <span className="l-pill accent" style={{ display: 'inline-flex', marginBottom: 14 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} /> {t('landing.badge')}
        </span>
        <h1 className="l-display" style={{ fontSize: 36, margin: '0 0 12px 0', fontWeight: 400, lineHeight: 1.1 }}>
          {t('landing.heroLine1')}<br /><em>{t('landing.heroLine2')}</em>
        </h1>
        <p style={{ font: '400 15px/1.55 var(--font-sans)', color: 'var(--ink-2)', margin: '0 0 20px 0' }}>
          {t('landing.subtitle')}
        </p>

        {/* Tablet: 2-col grid for card + legend */}
        <div className="md:grid md:gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="l-card" style={{ padding: 16, boxShadow: 'var(--shadow-2)', marginBottom: 16 }}>
            <div className="l-label" style={{ marginBottom: 10 }}>{t('landing.openMapLabel')}</div>
            <div className="flex-col md:flex-row flex" style={{ gap: 8 }}>
              <Selector country={from} countries={countries} onSelect={setFrom} title={t('landing.fromLabel', 'From country')} />
              <div className="flex justify-center md:items-center" style={{ flexShrink: 0 }}>
                <div
                  className="md:hidden flex items-center justify-center"
                  style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--accent-tint)' }}
                >
                  <Icon name="arrowRight" size={14} style={{ color: 'var(--accent-hover)', transform: 'rotate(90deg)' }} />
                </div>
                <Icon name="arrowRight" size={16} className="hidden md:block" style={{ color: 'var(--accent)' }} />
              </div>
              <Selector country={to} countries={countries} onSelect={setTo} title={t('landing.toLabel', 'To country')} />
            </div>
            <Button variant="accent" fullWidth style={{ height: 50, marginTop: 14, fontSize: 15 }} onClick={() => navigate('/map')}>
              {t('landing.openMap', 'Open map')} <Icon name="arrowRight" size={15} stroke={2} />
            </Button>
            <div style={{ marginTop: 10, font: '500 12px/1 var(--font-sans)', color: 'var(--ink-3)', textAlign: 'center' }}>
              {t('landing.browseHint')}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', alignContent: 'flex-start' }}>
            {LEGEND.map((type) => (
              <div key={type} className="flex items-center" style={{ gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: TYPE_META[type].dot }} />
                <span style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--ink-2)' }}>{t(`orgType.${type}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
