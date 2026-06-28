import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon, { type IconName } from '@/components/ui/Icon'

const TABS: Array<{ key: string; to: string; icon: IconName; labelKey: string }> = [
  { key: 'map',       to: '/map',       icon: 'pin',      labelKey: 'nav.map' },
  { key: 'countries', to: '/countries', icon: 'globe',    labelKey: 'nav.countries' },
  { key: 'saved',     to: '/saved',     icon: 'bookmark', labelKey: 'nav.saved' },
  { key: 'account',   to: '/account',   icon: 'user',     labelKey: 'nav.account' },
]

export default function MobileBottomNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const activeKey = pathname.startsWith('/countries')
    ? 'countries'
    : pathname.startsWith('/saved')
      ? 'saved'
      : pathname.startsWith('/account') || pathname.startsWith('/messages')
        ? 'account'
        : 'map'

  return (
    <nav
      aria-label={t('topbar.mainNav')}
      style={{
        display: 'flex',
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderTop: '1px solid var(--border-1)',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {TABS.map((tab) => {
        const active = tab.key === activeKey
        return (
          <Link
            key={tab.key}
            to={tab.to}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 10,
              gap: 3,
              textDecoration: 'none',
              color: active ? 'var(--ink-1)' : 'var(--ink-4)',
              minHeight: 44,
            }}
          >
            <Icon name={tab.icon} size={21} />
            <span style={{ font: '600 9.5px/1 var(--font-sans)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {t(`topbar.nav.${tab.key}`, tab.key)}
            </span>
            {active && (
              <div style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--accent)' }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
