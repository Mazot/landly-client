/* Sign up — corridor step (/signup/corridor). Account → Corridor two-step flow. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { flagOf } from '@/lib/countries'
import { useCorridor } from '@/hooks/useCorridor'
import { useDisplayOrgs } from '@/hooks/useDisplayOrgs'
import { useToggleSet } from '@/hooks/useToggleSet'
import Icon from '@/components/ui/Icon'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/Button'
import CorridorPicker from '@/components/ui/CorridorPicker'
import AuthSplitLayout from '@/components/ui/AuthSplitLayout'

const STEPS = ['account', 'corridor'] as const
const STAT_KEYS = ['consulates', 'communities', 'businesses', 'volunteers'] as const
const ROLES = ['newcomer', 'helping', 'exploring']
const LANGS = ['russian', 'english', 'german', 'addMore']

export default function SignupCorridorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { from, to, fromId, toId, setCorridor, countries } = useCorridor()
  const current = 1
  const [role, setRole] = useState('newcomer')
  const { has: hasLang, toggle: toggleLang } = useToggleSet<string>(['russian', 'english'])

  const { items } = useDisplayOrgs({ location_country_id: toId ?? undefined, limit: 200 })
  const statValues: Record<(typeof STAT_KEYS)[number], number> = {
    consulates: items.filter((o) => o.typeKey === 'embassy').length,
    communities: items.filter((o) => o.typeKey === 'community').length,
    businesses: items.filter((o) => o.typeKey === 'business').length,
    volunteers: items.filter((o) => o.typeKey === 'volunteer' || o.typeKey === 'helper').length,
  }
  const popular = countries.filter((c) => c.id !== fromId).slice(0, 8)

  const statCard = (
    <div className="l-card" style={{ padding: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 420 }}>
      <div className="l-label" style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>{t('signupCorridor.corridorHas', { from: flagOf(from), to: flagOf(to) })}</div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 14 }}>
        {STAT_KEYS.map((vk) => (
          <div key={vk}>
            <div style={{ font: '600 18px/1 var(--font-sans)', color: '#fff' }}>{statValues[vk]}</div>
            <div style={{ font: '500 11.5px/1 var(--font-sans)', color: 'rgba(255,255,255,0.55)', marginTop: 5 }}>{t(`signupCorridor.stats.${vk}`)}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <AuthSplitLayout
      eyebrow={t('signupCorridor.eyebrow')}
      title={<>{t('signupCorridor.heroLine1')}<br /><em>{t('signupCorridor.heroLine2')}</em></>}
      subtitle={t('signupCorridor.blurb')}
      titleSize={56}
      aside={statCard}
    >
      {/* right form */}
      <div className="flex flex-col" style={{ padding: '44px 64px', overflow: 'hidden' }}>
        <div className="flex justify-end" style={{ marginBottom: 28 }}>
          <span style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
            {t('signupCorridor.haveAccount')}{' '}
            <span style={{ color: 'var(--ink-1)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }} onClick={() => navigate('/login')}>{t('signupCorridor.signIn')}</span>
          </span>
        </div>

        {/* step tabs */}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 8, marginBottom: 36 }}>
          {STEPS.map((s, i) => {
            const done = i < current
            const active = i === current
            return (
              <div
                key={s}
                className="flex items-center"
                style={{
                  gap: 9,
                  padding: '12px 12px',
                  borderRadius: 10,
                  background: active ? 'var(--surface)' : done ? 'var(--accent-tint)' : 'var(--surface-2)',
                  border: active ? '1px solid var(--ink-1)' : done ? '1px solid var(--accent-soft)' : '1px solid var(--border-1)',
                }}
              >
                <span
                  className="inline-flex items-center justify-center"
                  style={{ width: 22, height: 22, borderRadius: 999, background: done ? 'var(--accent)' : active ? 'var(--ink-1)' : 'transparent', color: done || active ? '#fff' : 'var(--ink-3)', border: done || active ? 'none' : '1px solid var(--border-2)', font: '700 11px/1 var(--font-sans)' }}
                >
                  {done ? <Icon name="check" size={12} stroke={2.4} /> : i + 1}
                </span>
                <span style={{ font: '600 13px/1 var(--font-sans)', color: active || done ? 'var(--ink-1)' : 'var(--ink-3)' }}>{t(`signupCorridor.steps.${s}`)}</span>
              </div>
            )
          })}
        </div>

        <div className="l-scroll" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ maxWidth: 560 }}>
            <CorridorPicker />

            <div style={{ marginTop: 20 }}>
              <div className="l-label" style={{ marginBottom: 10 }}>{t('signupCorridor.popularFrom', { country: from?.name ?? '—' })}</div>
              <div className="flex flex-wrap" style={{ gap: 8 }}>
                {popular.map((c) => (
                  <Chip
                    key={c.id}
                    active={to?.id === c.id}
                    leading={<span style={{ fontSize: 14 }}>{flagOf(c)}</span>}
                    onClick={() => fromId && setCorridor(fromId, c.id)}
                    style={{ padding: '8px 13px 8px 10px' }}
                  >
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="l-hairline" style={{ margin: '24px 0 20px 0' }} />

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="l-label" style={{ marginBottom: 10 }}>{t('signupCorridor.hereAs')}</div>
                <div className="flex flex-wrap" style={{ gap: 7 }}>
                  {ROLES.map((r) => (
                    <Chip key={r} active={role === r} onClick={() => setRole(r)}>
                      {t(`signupCorridor.roles.${r}`)}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <div className="l-label" style={{ marginBottom: 10 }}>{t('signupCorridor.languages')}</div>
                <div className="flex flex-wrap" style={{ gap: 7 }}>
                  {LANGS.map((l) => (
                    <Chip key={l} active={hasLang(l)} onClick={() => toggleLang(l)}>
                      {l === 'addMore' ? t('signupCorridor.langs.addMore') : t(`signupCorridor.langs.${l}`)}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center" style={{ marginTop: 22, padding: '14px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border-1)', gap: 12 }}>
              <Icon name="sparkle" size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div style={{ font: '500 13px/1.45 var(--font-sans)', color: 'var(--ink-2)' }}>
                {t('signupCorridor.tip')}
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between" style={{ marginTop: 24 }}>
          <Button variant="ghost" onClick={() => navigate('/signup')}>
            <Icon name="arrowLeft" size={14} stroke={2} /> {t('signupCorridor.back')}
          </Button>
          <div className="flex" style={{ gap: 4 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: 24, height: 4, borderRadius: 2, background: i <= current ? 'var(--ink-1)' : 'var(--border-2)' }} />
            ))}
          </div>
          <Button variant="accent" onClick={() => navigate('/map')}>
            {t('signupCorridor.finish')} <Icon name="arrowRight" size={14} stroke={2} />
          </Button>
        </div>
      </div>
    </AuthSplitLayout>
  )
}
