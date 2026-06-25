/* First-run onboarding (/welcome) — warm welcome over the map + getting-started checklist. */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useCorridor } from '@/hooks/useCorridor'
import { useDisplayOrgs } from '@/hooks/useDisplayOrgs'
import TopBar from '@/components/ui/TopBar'
import Button from '@/components/ui/Button'
import Icon, { type IconName } from '@/components/ui/Icon'
import LandlyMap, { type MapMarker } from '@/components/map/LandlyMap'

interface Step {
  done: boolean
  title: string
  sub: string
  ic: IconName
}

export default function WelcomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { from, to, toId } = useCorridor()
  const firstName = (user?.username ?? 'there').split(' ')[0]
  const corridorNames = { from: from?.name ?? '—', to: to?.name ?? '—' }
  const { items } = useDisplayOrgs({ location_country_id: toId ?? undefined, limit: 10 })

  const steps: Step[] = [
    { done: true, title: t('welcome.steps.corridorSet.t'), sub: t('welcome.steps.corridorSet.s', corridorNames), ic: 'globe' },
    { done: false, title: t('welcome.steps.saveFirst.t'), sub: t('welcome.steps.saveFirst.s'), ic: 'bookmark' },
    { done: false, title: t('welcome.steps.addPlace.t'), sub: t('welcome.steps.addPlace.s'), ic: 'plus' },
  ]

  const markers: MapMarker[] = useMemo(
    () => items.filter((o) => o.coord).slice(0, 8).map((o) => ({ id: o.id, coord: o.coord!, type: o.typeKey, name: o.name })),
    [items]
  )

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar />

      <div className="relative" style={{ flex: 1, overflow: 'hidden' }}>
        <div className="absolute inset-0" style={{ opacity: 0.85 }}>
          <LandlyMap markers={markers} fitToMarkers showControls={false} interactive={false} />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(246,244,239,0.96) 0%, rgba(246,244,239,0.8) 38%, rgba(246,244,239,0) 70%)', pointerEvents: 'none' }}
        />

        {/* welcome panel */}
        <div className="absolute flex flex-col justify-center" style={{ top: 0, bottom: 0, left: 0, width: 560, padding: '0 64px', zIndex: 11 }}>
          <span className="l-pill accent" style={{ alignSelf: 'flex-start' }}>
            <Icon name="sparkle" size={13} /> {t('welcome.badge')}
          </span>
          <h1 className="l-display" style={{ fontSize: 56, margin: '20px 0 14px 0', fontWeight: 400, lineHeight: 1.05 }}>
            {t('welcome.hiName', { name: firstName })}<br />{t('welcome.letsLead')}<em>{t('welcome.getYouSetUp')}</em>
          </h1>
          <p style={{ font: '400 16px/1.6 var(--font-sans)', color: 'var(--ink-2)', maxWidth: 440, margin: 0 }}>
            {t('welcome.subtitle', corridorNames)}
          </p>

          {/* checklist */}
          <div className="l-card" style={{ marginTop: 28, padding: 10, maxWidth: 480, boxShadow: 'var(--shadow-2)' }}>
            {steps.map((st, i) => (
              <button
                key={st.title}
                onClick={() => navigate('/map')}
                className="flex items-center w-full"
                style={{ gap: 14, padding: '14px 14px', borderTop: i ? '1px solid var(--border-1)' : 'none', background: 'transparent', border: 0, borderTopStyle: i ? 'solid' : undefined, cursor: 'pointer', textAlign: 'left' }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{ width: 38, height: 38, borderRadius: 999, flexShrink: 0, background: st.done ? 'var(--ink-1)' : 'var(--surface-2)', color: st.done ? '#fff' : 'var(--ink-3)', border: st.done ? 'none' : '1px solid var(--border-2)' }}
                >
                  {st.done ? <Icon name="check" size={16} stroke={2.4} /> : <Icon name={st.ic} size={16} />}
                </span>
                <span style={{ flex: 1 }}>
                  <span className="block" style={{ font: '600 14.5px/1.2 var(--font-sans)', color: st.done ? 'var(--ink-3)' : 'var(--ink-1)', textDecoration: st.done ? 'line-through' : 'none' }}>{st.title}</span>
                  <span className="block" style={{ font: '500 12.5px/1.4 var(--font-sans)', color: 'var(--ink-3)', marginTop: 4 }}>{st.sub}</span>
                </span>
                {!st.done && <Icon name="chevronRight" size={16} style={{ color: 'var(--ink-4)' }} />}
              </button>
            ))}
          </div>

          <div className="flex items-center" style={{ gap: 14, marginTop: 22 }}>
            <Button variant="accent" size="lg" onClick={() => navigate('/map')}>
              {t('welcome.addFirstPlace')} <Icon name="arrowRight" size={15} stroke={2} />
            </Button>
            <Button variant="ghost" size="lg">{t('welcome.takeTour')}</Button>
            <button onClick={() => navigate('/map')} style={{ marginLeft: 'auto', font: '600 13px/1 var(--font-sans)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent', border: 0 }}>{t('welcome.skip')}</button>
          </div>
        </div>

        {/* hint card */}
        <div className="l-card absolute" style={{ bottom: 24, right: 24, width: 300, padding: 16, boxShadow: 'var(--shadow-3)', zIndex: 11 }}>
          <div className="flex items-center" style={{ gap: 9 }}>
            <Icon name="users" size={16} style={{ color: 'var(--type-volunteer)' }} />
            <span style={{ font: '600 13.5px/1.2 var(--font-sans)' }}>{t('welcome.knowSomeone')}</span>
          </div>
          <p style={{ font: '400 12.5px/1.5 var(--font-sans)', color: 'var(--ink-3)', margin: '9px 0 12px 0' }}>
            {t('welcome.recommendDesc')}
          </p>
          <Button variant="ghost" size="sm" fullWidth>
            <Icon name="plus" size={12} /> {t('welcome.recommendPerson')}
          </Button>
        </div>
      </div>
    </div>
  )
}
