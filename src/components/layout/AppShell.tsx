import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CorridorsSheet } from '@/components/corridor/CorridorsSheet'
import { Avatar, Button, CorridorPill, Logo, NavTabs, TabBar, TopBar, type NavTabsItem, type TabBarItem } from '@/components/ui'
import { useCurrentCorridor } from '@/hooks/useCurrentCorridor'
import { useMe } from '@/hooks/useUser'
import { ROUTES } from '@/lib/routes'
import { useBreakpoint } from '@/lib/useBreakpoint'
import { useAuthStore } from '@/stores/authStore'
import { LanguageSelect } from './LanguageSelect'
import { AppShellContext } from './appShellContext'

/**
 * Frame of the signed-in app and the public map: top bar with the corridor pill and the sections
 * from `md`, a bottom tab bar on phones. Screens render inside it and open the corridor picker
 * through `useAppShell`.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const size = useBreakpoint()
  const user = useAuthStore((state) => state.user)
  const me = useMe()
  const { from, to } = useCurrentCorridor()
  const [corridorsOpen, setCorridorsOpen] = useState(false)

  const guest = !user
  const sections: NavTabsItem[] = [
    { to: ROUTES.map, label: t('topbar.nav.map'), icon: 'pin' },
    { to: ROUTES.people, label: t('topbar.nav.people'), icon: 'users' },
    { to: ROUTES.countries, label: t('topbar.nav.countries'), icon: 'globe' },
    { to: ROUTES.saved, label: t('topbar.nav.saved'), icon: 'bookmark' },
  ]
  const tabs: TabBarItem[] = guest
    ? [
        { to: ROUTES.map, label: t('topbar.nav.map'), icon: 'pin' },
        { to: ROUTES.people, label: t('topbar.nav.people'), icon: 'users' },
        { to: ROUTES.countries, label: t('topbar.nav.countries'), icon: 'globe' },
        { to: ROUTES.signIn, label: t('topbar.signIn'), icon: 'user' },
      ]
    : [
        { to: ROUTES.map, label: t('topbar.nav.map'), icon: 'pin' },
        { to: ROUTES.people, label: t('topbar.nav.people'), icon: 'users' },
        { to: ROUTES.add, label: t('topbar.addOrganization'), icon: 'plus', primary: true },
        { to: ROUTES.saved, label: t('topbar.nav.saved'), icon: 'bookmark' },
        { to: ROUTES.account, label: t('topbar.nav.account'), icon: 'user' },
      ]

  const tablet = size === 'tablet'
  return (
    <AppShellContext.Provider value={{ openCorridors: () => setCorridorsOpen(true) }}>
      <div className="flex h-dvh flex-col bg-bg">
        {size !== 'phone' && (
          <TopBar
            brand={
              <>
                <Logo to={ROUTES.map} size="sm" variant={tablet ? 'mark' : 'full'} className="min-w-11 justify-center" />
                {from && to && <CorridorPill from={from.flag} to={to.flag} label={t('corridorSwitcher.label', { from: from.name, to: to.name })} name={to.name} onClick={() => setCorridorsOpen(true)} />}
              </>
            }
            nav={<NavTabs items={sections} label={t('topbar.main')} compact={tablet} />}
            actions={
              <>
                {!tablet && <LanguageSelect />}
                {guest ? (
                  <>
                    <Button to={ROUTES.signIn} variant="secondary" size="sm">
                      {t('topbar.signIn')}
                    </Button>
                    <Button to={ROUTES.signUp} variant="accent" size="sm">
                      {t('topbar.createAccount')}
                    </Button>
                  </>
                ) : (
                  <>
                    {tablet ? <Button to={ROUTES.add} variant="secondary" size="sm" icon="plus" aria-label={t('topbar.addOrganization')} /> : <Button to={ROUTES.add} variant="secondary" size="sm" icon="plus">{t('topbar.add')}</Button>}
                    {/* Named by its content ("Profile" + the avatar's name), not aria-label: the visible initials must not contradict the name (Lighthouse label-content-name-mismatch). */}
                    <Link to={ROUTES.account} className="inline-flex size-11 items-center justify-center rounded-full">
                      <span className="sr-only">{t('topbar.profile')}</span>{' '}
                      <Avatar name={me.data?.name || user.username} color={me.data?.avatarColor} size="sm" />
                    </Link>
                  </>
                )}
              </>
            }
          />
        )}
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        {size === 'phone' && <TabBar items={tabs} label={t('topbar.main')} />}
        {corridorsOpen && <CorridorsSheet onClose={() => setCorridorsOpen(false)} />}
      </div>
    </AppShellContext.Provider>
  )
}
