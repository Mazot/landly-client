/* Account (/account) — profile, my orgs, my people, corridors. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useCorridor } from '@/hooks/useCorridor'
import Avatar from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import TypeChip from '@/components/ui/TypeChip'
import Badge from '@/components/ui/Badge'
import Divider from '@/components/ui/Divider'
import TabBar from '@/components/ui/TabBar'
import FlagPair from '@/components/ui/FlagPair'
import ScrollArea from '@/components/ui/ScrollArea'
import { flagOf } from '@/lib/countries'
import AppShell from '@/layouts/AppShell'
import StickySection from '@/layouts/StickySection'

type TabKey = 'profile' | 'myOrgs' | 'myPeople' | 'corridors'

const STATUS_COLORS: Record<string, string> = {
  live: 'var(--type-helper)',
  pending: 'var(--type-business)',
  rejected: 'var(--danger)',
  confirmed: 'var(--type-helper)',
  awaiting: 'var(--ink-3)',
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <Badge color={STATUS_COLORS[status] ?? 'var(--ink-3)'}>
      {t(`account.status.${status}`, status)}
    </Badge>
  )
}

const SAMPLE_ORGS = [
  { id: '1', name: 'Babushka Bakery', typeKey: 'business' as const, typeLabel: 'Business', typeColor: '#B8814A', city: 'Munich', status: 'pending', note: 'Moderator checking address — <24h', initials: 'BB' },
  { id: '2', name: 'Russian House Volunteers', typeKey: 'community' as const, typeLabel: 'Community', typeColor: '#8B5A8C', city: 'Berlin', status: 'live', note: '1,240 visits this month', initials: 'RH' },
]
const SAMPLE_PEOPLE = [
  { id: '1', name: 'Igor Petrov', status: 'confirmed', sub: 'Confirmed · 27 reviews', initials: 'IP', color: '#C7613F' },
  { id: '2', name: 'Daria K.', status: 'awaiting', sub: 'Sent via WhatsApp · 2d ago', initials: 'DK', color: '#4F7F5C' },
]

export default function AccountPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { from, to } = useCorridor()
  const [tab, setTab] = useState<TabKey>('myOrgs')

  const TABS = [
    { key: 'profile',   label: t('account.tabs.profile') },
    { key: 'myOrgs',    label: t('account.tabs.myOrgs') },
    { key: 'myPeople',  label: t('account.tabs.myPeople') },
    { key: 'corridors', label: t('account.tabs.corridors') },
  ]

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'ME'
  const displayName = user?.username ?? 'Anonymous'

  if (!user) {
    return (
      <AppShell showBottomNav>
        <div className="flex flex-col items-center justify-center" style={{ flex: 1, gap: 16, padding: 24 }}>
          <Icon name="user" size={40} style={{ color: 'var(--ink-4)' }} />
          <p style={{ font: '500 15px/1.5 var(--font-sans)', color: 'var(--ink-3)', textAlign: 'center' }}>
            {t('account.signIn')}
          </p>
          <Button variant="accent" onClick={() => navigate('/signup')}>
            {t('signupOne.createAccount')} <Icon name="arrowRight" size={14} />
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showBottomNav>
      <StickySection>
        {/* Profile strip */}
        <div className="flex items-center" style={{ padding: '16px 18px 14px', gap: 14 }}>
          <Avatar initials={initials} color="var(--accent)" size={58} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <span style={{ font: '600 18px/1.2 var(--font-sans)' }}>{displayName}</span>
              <Badge tone="accent">{t('account.roleNewcomer')}</Badge>
            </div>
            {(from || to) && (
              <div className="flex items-center" style={{ font: '500 12.5px/1.4 var(--font-sans)', color: 'var(--ink-3)', marginTop: 5, gap: 5 }}>
                <FlagPair fromFlag={flagOf(from)} toFlag={flagOf(to)} size={14} gap={3} arrowSize={10} arrowColor="var(--accent)" />
                {to?.capitalCity && <span>· {to.capitalCity}</span>}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
            {t('account.edit')}
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid var(--border-1)' }}>
          {([['3', 'places'], ['2', 'people'], ['247', 'helped'], ['4.9', 'rating']] as const).map(([k, v], i) => (
            <div key={v} style={{ padding: '10px 0', textAlign: 'center', borderLeft: i ? '1px solid var(--border-1)' : 'none' }}>
              <div style={{ font: '700 17px/1 var(--font-sans)' }}>{k}</div>
              <div style={{ font: '500 10.5px/1 var(--font-sans)', color: 'var(--ink-3)', marginTop: 4 }}>{t(`account.stats.${v}`)}</div>
            </div>
          ))}
        </div>

        <TabBar tabs={TABS} activeKey={tab} onChange={(k) => setTab(k as TabKey)} />
      </StickySection>

      <ScrollArea padding="16px 16px 24px">
        {tab === 'myOrgs' && (
          <>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span style={{ font: '600 15px/1 var(--font-sans)' }}>
                {t('account.myOrgs')} <span style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>{SAMPLE_ORGS.length}</span>
              </span>
              <Button size="sm">
                <Icon name="plus" size={12} /> {t('account.addOrg')}
              </Button>
            </div>
            <div className="flex flex-col" style={{ gap: 10 }}>
              {SAMPLE_ORGS.map((o) => (
                <div key={o.id} className="l-card" style={{ padding: 14 }}>
                  <div className="flex items-center" style={{ gap: 11 }}>
                    <Avatar initials={o.initials} color={o.typeColor} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: '600 14px/1.2 var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</div>
                      <div className="flex items-center" style={{ gap: 7, marginTop: 6 }}>
                        <TypeChip type={o.typeKey} label={o.typeLabel} soft />
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                    <Icon name="chevronRight" size={14} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                  </div>
                  <div className="flex" style={{ marginTop: 10, font: '500 12px/1.45 var(--font-sans)', color: o.status === 'rejected' ? 'var(--danger)' : 'var(--ink-3)', gap: 7, alignItems: 'flex-start' }}>
                    <Icon name={o.status === 'rejected' ? 'flag' : o.status === 'pending' ? 'clock' : 'check'} size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                    {o.note}
                  </div>
                  {o.status === 'rejected' && (
                    <Button variant="ghost" size="sm" fullWidth style={{ marginTop: 10 }}>
                      {t('account.fixResubmit')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'myPeople' && (
          <>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span style={{ font: '600 15px/1 var(--font-sans)' }}>{t('account.myPeople')}</span>
              <Button size="sm">
                <Icon name="plus" size={12} /> {t('account.recommend')}
              </Button>
            </div>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {SAMPLE_PEOPLE.map((p) => (
                <div key={p.id} className="l-card flex items-center" style={{ padding: 13, gap: 11 }}>
                  <Avatar initials={p.initials} color={p.color} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center" style={{ gap: 7 }}>
                      <span style={{ font: '600 13.5px/1.2 var(--font-sans)' }}>{p.name}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div style={{ font: '500 11.5px/1.3 var(--font-sans)', color: 'var(--ink-3)', marginTop: 5 }}>{p.sub}</div>
                  </div>
                  {p.status === 'awaiting' && (
                    <Button variant="ghost" size="sm">{t('account.resend')}</Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'profile' && (
          <div className="flex flex-col" style={{ gap: 14, paddingTop: 4 }}>
            <div style={{ font: '400 14px/1.6 var(--font-sans)', color: 'var(--ink-2)' }}>
              {t('welcome.subtitle', { from: from?.name ?? '—', to: to?.name ?? '—' })}
            </div>
            <Divider />
            <Button variant="ghost" fullWidth onClick={() => navigate('/profile')}>
              {t('account.settings')}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => { clearAuth(); navigate('/') }}>
              {t('account.signOut')}
            </Button>
          </div>
        )}

        {tab === 'corridors' && (
          <div className="l-card flex items-center" style={{ padding: 16, gap: 12, marginTop: 4 }}>
            <FlagPair fromFlag={flagOf(from)} toFlag={flagOf(to)} size={22} gap={7} arrowSize={13} arrowColor="var(--accent)" />
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 14px/1.2 var(--font-sans)' }}>{from?.name ?? '—'} → {to?.name ?? '—'}</div>
            </div>
            <Badge tone="accent">{t('account.statusActive')}</Badge>
          </div>
        )}
      </ScrollArea>
    </AppShell>
  )
}
