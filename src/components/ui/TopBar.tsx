/* Global top app bar — responsive: mobile flags-only, tablet/desktop full. */
import { createPortal } from 'react-dom'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCorridor } from '@/hooks/useCorridor'
import { useAuthStore } from '@/stores/authStore'
import CountryPicker from './CountryPicker'
import Logo from './Logo'
import Avatar from './Avatar'
import Button from './Button'
import Icon from './Icon'

const NAV = [
  { key: 'map',       to: '/map' },
  { key: 'countries', to: '/countries' },
  { key: 'saved',     to: '/saved' },
] as const

export default function TopBar() {
  const { t } = useTranslation()
  const { from, to, countries, setFrom, setTo } = useCorridor()
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState<'from' | 'to' | null>(null)

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

      {/* Corridor pill — from + to each independently clickable */}
      <div
        className="relative ml-auto md:ml-0 inline-flex items-center"
        style={{
          gap: 4,
          padding: '4px 5px',
          borderRadius: 999,
          background: 'var(--surface-2)',
          border: '1px solid var(--border-1)',
        }}
      >
        {/* From button */}
        <button
          onClick={() => setPickerOpen('from')}
          className="inline-flex items-center"
          style={{
            gap: 5, padding: '4px 8px 4px 6px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border-1)',
            cursor: 'pointer', font: '600 13px/1 var(--font-sans)', color: 'var(--ink-1)',
          }}
          aria-label={t('topbar.changeFrom', 'Change from country')}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{from?.flag || '🏳️'}</span>
          <span className="hidden md:inline">{from?.name ?? '—'}</span>
        </button>

        <Icon name="arrowRight" size={12} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />

        {/* To button */}
        <button
          onClick={() => setPickerOpen('to')}
          className="inline-flex items-center"
          style={{
            gap: 5, padding: '4px 8px 4px 6px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border-1)',
            cursor: 'pointer', font: '600 13px/1 var(--font-sans)', color: 'var(--ink-1)',
          }}
          aria-label={t('topbar.changeTo', 'Change to country')}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{to?.flag || '🏳️'}</span>
          <span className="hidden md:inline">{to?.name ?? '—'}</span>
        </button>
      </div>

      {/* Country picker portal */}
      {pickerOpen && createPortal(
        <CountryPicker
          title={pickerOpen === 'from'
            ? t('topbar.changeFrom', 'From country')
            : t('topbar.changeTo', 'To country')}
          countries={countries}
          selectedId={pickerOpen === 'from' ? from?.id : to?.id}
          onSelect={pickerOpen === 'from' ? setFrom : setTo}
          onClose={() => setPickerOpen(null)}
        />,
        document.body
      )}

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
