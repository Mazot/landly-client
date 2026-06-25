/* Global top app bar — corridor pill, primary nav, add/notify/avatar (auth-aware). */
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
  { key: 'map', to: '/map' },
  { key: 'countries', to: '/countries' },
  { key: 'saved', to: '/saved' },
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

  return (
    <div
      className="flex items-center relative"
      style={{
        height: 60,
        padding: '0 20px',
        borderBottom: '1px solid var(--border-1)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 20,
      }}
    >
      <Link to="/map" aria-label={t('topbar.home')}>
        <Logo size={26} />
      </Link>
      <div style={{ width: 1, height: 22, background: 'var(--border-1)', margin: '0 18px' }} />

      {/* corridor pill + switcher */}
      <div className="relative" ref={corridorRef}>
        <button
          onClick={() => setCorridorOpen((v) => !v)}
          className="inline-flex items-center"
          style={{
            gap: 6,
            padding: 6,
            borderRadius: 999,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-1)',
            cursor: 'pointer',
            boxShadow: corridorOpen
              ? '0 0 0 2px var(--accent), 0 0 0 6px rgba(217,119,87,0.18)'
              : 'none',
          }}
        >
          <CountryPill flag={from?.flag} name={from?.name} size="sm" />
          <Icon name="arrowRight" size={14} style={{ color: 'var(--ink-3)' }} />
          <CountryPill flag={to?.flag} name={to?.name} size="sm" />
        </button>
        {corridorOpen && <CorridorSwitcher onClose={() => setCorridorOpen(false)} />}
      </div>

      <nav className="flex" style={{ gap: 6, marginLeft: 24 }}>
        {NAV.map((n) => {
          const active = n.key === activeKey
          return (
            <Link
              key={n.key}
              to={n.to}
              style={{
                font: '600 13.5px/1 var(--font-sans)',
                padding: '8px 12px',
                borderRadius: 8,
                color: active ? 'var(--ink-1)' : 'var(--ink-3)',
                background: active ? 'var(--surface-2)' : 'transparent',
                border: active ? '1px solid var(--border-1)' : '1px solid transparent',
              }}
            >
              {t(`topbar.nav.${n.key}`)}
            </Link>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {isAuthenticated ? (
        <>
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
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" style={{ marginRight: 10 }} onClick={() => navigate('/login')}>
            {t('topbar.signIn')}
          </Button>
          <Button variant="accent" size="sm" onClick={() => navigate('/signup')}>
            {t('topbar.createAccount')}
          </Button>
        </>
      )}
    </div>
  )
}
