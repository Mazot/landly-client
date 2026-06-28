/* Global top app bar — responsive: mobile flags-only, tablet/desktop full. */
import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCorridor } from '@/hooks/useCorridor'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useAuthStore } from '@/stores/authStore'
import CorridorSwitcher from '@/components/map/CorridorSwitcher'
import Logo from './Logo'
import Avatar from './Avatar'
import CountryPill from './CountryPill'
import Button from './Button'
import Icon from './Icon'

const NAV = [
  { key: 'map',       to: '/map' },
  { key: 'countries', to: '/countries' },
  { key: 'saved',     to: '/saved' },
] as const

export default function TopBar() {
  const { t } = useTranslation()
  const { from, to } = useCorridor()
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [corridorOpen, setCorridorOpen] = useState(false)
  const corridorRef = useRef<HTMLDivElement>(null)
  useClickOutside(corridorRef, () => setCorridorOpen(false), corridorOpen)

  const path = location.pathname
  const activeKey = path.startsWith('/countries')
    ? 'countries'
    : path.startsWith('/saved')
      ? 'saved'
      : 'map'

  const initials = (user?.username ?? user?.email ?? 'AM').slice(0, 2).toUpperCase()

  const corridorRing = corridorOpen
    ? '0 0 0 2px var(--accent), 0 0 0 6px rgba(217,119,87,0.18)'
    : 'none'

  return (
    <div
      className="flex items-center relative"
      style={{
        // 56px mobile, 60px tablet+
        height: 56,
        padding: '0 16px',
        borderBottom: '1px solid var(--border-1)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link to="/map" aria-label={t('topbar.home')}>
        <span className="md:hidden"><Logo size={22} /></span>
        <span className="hidden md:block"><Logo size={26} /></span>
      </Link>

      {/* Divider — tablet/desktop only */}
      <div
        className="hidden md:block"
        style={{ width: 1, height: 22, background: 'var(--border-1)', margin: '0 18px' }}
      />

      {/* Corridor pill + switcher */}
      <div
        className="relative ml-auto md:ml-0"
        ref={corridorRef}
      >
        {/* Mobile: flags-only pill */}
        <button
          onClick={() => setCorridorOpen((v) => !v)}
          className="md:hidden inline-flex items-center"
          style={{
            gap: 5,
            padding: '5px 5px 5px 8px',
            borderRadius: 999,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-1)',
            cursor: 'pointer',
            boxShadow: corridorRing,
          }}
          aria-label={t('topbar.corridorLabel', 'Switch corridor')}
        >
          <span style={{ fontSize: 15 }}>{from?.flag || '🏳️'}</span>
          <Icon name="arrowRight" size={11} style={{ color: 'var(--ink-3)' }} />
          <span style={{ fontSize: 15 }}>{to?.flag || '🏳️'}</span>
        </button>

        {/* Tablet/Desktop: full pill with country names */}
        <button
          onClick={() => setCorridorOpen((v) => !v)}
          className="hidden md:inline-flex items-center"
          style={{
            gap: 6,
            padding: 6,
            borderRadius: 999,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-1)',
            cursor: 'pointer',
            boxShadow: corridorRing,
          }}
        >
          <CountryPill flag={from?.flag} name={from?.name} size="sm" />
          <Icon name="arrowRight" size={14} style={{ color: 'var(--ink-3)' }} />
          <CountryPill flag={to?.flag} name={to?.name} size="sm" />
        </button>

        {corridorOpen && <CorridorSwitcher onClose={() => setCorridorOpen(false)} />}
      </div>

      {/* Nav links — tablet/desktop only */}
      <nav className="hidden md:flex" style={{ gap: 6, marginLeft: 24 }}>
        {NAV.map((n) => {
          const active = n.key === activeKey
          return (
            <Link
              key={n.key}
              to={n.to}
              aria-current={active ? 'page' : undefined}
              style={{
                font: '600 13.5px/1 var(--font-sans)',
                padding: '8px 12px',
                borderRadius: 8,
                color: active ? 'var(--ink-1)' : 'var(--ink-3)',
                background: active ? 'var(--surface-2)' : 'transparent',
                border: active ? '1px solid var(--border-1)' : '1px solid transparent',
                textDecoration: 'none',
              }}
            >
              {t(`topbar.nav.${n.key}`)}
            </Link>
          )
        })}
      </nav>

      {/* Spacer — tablet/desktop only */}
      <div className="hidden md:block" style={{ flex: 1 }} />

      {/* Auth actions — tablet/desktop only */}
      {isAuthenticated ? (
        <div className="hidden md:flex items-center">
          <Button variant="ghost" size="sm" style={{ marginRight: 10 }}>
            <Icon name="plus" size={14} /> {t('topbar.addOrganization')}
          </Button>
          <Button variant="ghost" size="sm" iconButton style={{ width: 36, height: 36 }} aria-label={t('topbar.notifications')}>
            <Icon name="bell" size={16} />
          </Button>
          <div style={{ width: 10 }} />
          <Link to="/profile" aria-label={t('topbar.profile')}>
            <Avatar initials={initials} size={32} color="#4A6D8C" />
          </Link>
        </div>
      ) : (
        <div className="hidden md:flex items-center" style={{ gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            {t('topbar.signIn')}
          </Button>
          <Button variant="accent" size="sm" onClick={() => navigate('/signup')}>
            {t('topbar.createAccount')}
          </Button>
        </div>
      )}

      {/* Bell icon — mobile only */}
      <button
        className="md:hidden"
        style={{
          background: 'transparent',
          border: 0,
          color: 'var(--ink-2)',
          cursor: 'pointer',
          padding: 6,
          marginLeft: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 44,
          minHeight: 44,
        }}
        aria-label={t('topbar.notifications')}
      >
        <Icon name="bell" size={18} />
      </button>
    </div>
  )
}
