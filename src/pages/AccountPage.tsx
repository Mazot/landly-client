/* Account (/account, /profile) — profile, my orgs, my people, corridors. */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useCorridor } from '@/hooks/useCorridor'
import Avatar from '@/components/ui/Avatar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Divider from '@/components/ui/Divider'
import TabBar from '@/components/ui/TabBar'
import FlagPair from '@/components/ui/FlagPair'
import ScrollArea from '@/components/ui/ScrollArea'
import CreateOrganizationModal from '@/components/organizations/CreateOrganizationModal'
import { flagOf } from '@/lib/countries'
import AppShell from '@/layouts/AppShell'
import StickySection from '@/layouts/StickySection'

type TabKey = 'profile' | 'myOrgs' | 'myPeople' | 'corridors'

function EmptyState({ icon, text, action }: { icon: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center" style={{ padding: '40px 16px', gap: 14, textAlign: 'center' }}>
      <Icon name={icon as any} size={36} style={{ color: 'var(--ink-4)' }} />
      <p style={{ font: '500 14px/1.5 var(--font-sans)', color: 'var(--ink-3)', margin: 0 }}>{text}</p>
      {action}
    </div>
  )
}

export default function AccountPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { from, to } = useCorridor()
  const [tab, setTab] = useState<TabKey>('profile')
  const [createOrgOpen, setCreateOrgOpen] = useState(false)

  const TABS = [
    { key: 'profile',   label: t('account.tabs.profile') },
    { key: 'myOrgs',    label: t('account.tabs.myOrgs') },
    { key: 'myPeople',  label: t('account.tabs.myPeople') },
    { key: 'corridors', label: t('account.tabs.corridors') },
  ]

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

  const initials = user.username.slice(0, 2).toUpperCase()

  return (
    <AppShell showBottomNav>
      <CreateOrganizationModal
        isOpen={createOrgOpen}
        onClose={() => setCreateOrgOpen(false)}
        onCreated={() => setCreateOrgOpen(false)}
      />
      <StickySection>
        {/* Profile strip */}
        <div className="flex items-center" style={{ padding: '16px 18px 14px', gap: 14 }}>
          <Avatar initials={initials} color="var(--accent)" size={58} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 18px/1.2 var(--font-sans)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.username}
            </div>
            <div style={{ font: '400 13px/1.4 var(--font-sans)', color: 'var(--ink-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
            {(from || to) && (
              <div className="flex items-center" style={{ font: '500 12px/1.4 var(--font-sans)', color: 'var(--ink-3)', marginTop: 4, gap: 5 }}>
                <FlagPair fromFlag={flagOf(from)} toFlag={flagOf(to)} size={13} gap={3} arrowSize={9} arrowColor="var(--accent)" />
                {from?.name && to?.name && <span>{from.name} → {to.name}</span>}
              </div>
            )}
          </div>
        </div>

        <TabBar tabs={TABS} activeKey={tab} onChange={(k) => setTab(k as TabKey)} />
      </StickySection>

      <ScrollArea padding="16px 16px 40px">
        {tab === 'profile' && (
          <div className="flex flex-col" style={{ gap: 10 }}>
            <div className="l-card" style={{ padding: 16 }}>
              <div className="l-label" style={{ marginBottom: 12 }}>{t('account.tabs.profile')}</div>
              <div className="flex flex-col" style={{ gap: 10 }}>
                <div>
                  <div style={{ font: '500 11px/1 var(--font-sans)', color: 'var(--ink-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('profile.username')}</div>
                  <div style={{ font: '500 14px/1 var(--font-sans)' }}>{user.username}</div>
                </div>
                <Divider />
                <div>
                  <div style={{ font: '500 11px/1 var(--font-sans)', color: 'var(--ink-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('profile.email')}</div>
                  <div style={{ font: '500 14px/1 var(--font-sans)' }}>{user.email}</div>
                </div>
                <Divider />
                <div>
                  <div style={{ font: '500 11px/1 var(--font-sans)', color: 'var(--ink-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('profile.userId')}</div>
                  <div style={{ font: '500 11px/1 var(--font-sans)', color: 'var(--ink-3)', wordBreak: 'break-all' }}>{user.id}</div>
                </div>
              </div>
            </div>

            <Button variant="ghost" fullWidth onClick={() => { clearAuth(); navigate('/') }}>
              {t('account.signOut')}
            </Button>
          </div>
        )}

        {tab === 'myOrgs' && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span style={{ font: '600 15px/1 var(--font-sans)' }}>{t('account.tabs.myOrgs')}</span>
              <Button size="sm" onClick={() => setCreateOrgOpen(true)}>
                <Icon name="plus" size={12} /> {t('account.addOrg')}
              </Button>
            </div>
            <EmptyState
              icon="building"
              text={t('account.noOrgs', 'You haven\'t added any organisations yet')}
            />
          </div>
        )}

        {tab === 'myPeople' && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span style={{ font: '600 15px/1 var(--font-sans)' }}>{t('account.tabs.myPeople')}</span>
              <Button size="sm">
                <Icon name="plus" size={12} /> {t('account.recommend')}
              </Button>
            </div>
            <EmptyState
              icon="users"
              text={t('account.noPeople', 'No people recommendations yet')}
            />
          </div>
        )}

        {tab === 'corridors' && (
          <div>
            <div style={{ font: '600 15px/1 var(--font-sans)', marginBottom: 12 }}>{t('account.tabs.corridors')}</div>
            {from && to ? (
              <div className="l-card flex items-center" style={{ padding: 16, gap: 12 }}>
                <FlagPair fromFlag={flagOf(from)} toFlag={flagOf(to)} size={22} gap={7} arrowSize={13} arrowColor="var(--accent)" />
                <div style={{ flex: 1 }}>
                  <div style={{ font: '600 14px/1.2 var(--font-sans)' }}>{from.name} → {to.name}</div>
                </div>
                <Badge tone="accent">{t('account.statusActive')}</Badge>
              </div>
            ) : (
              <EmptyState icon="globe" text={t('account.noCorridor', 'No active corridor')} />
            )}
          </div>
        )}
      </ScrollArea>
    </AppShell>
  )
}
