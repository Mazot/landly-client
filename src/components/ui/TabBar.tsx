import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'

export interface TabBarItem {
  to: string
  label: string
  icon: IconName
  /** Only the exact route marks it active (use for "/"). */
  end?: boolean
  /** Round accent button in the middle ("Add a place"); label becomes its aria-label. */
  primary?: boolean
}

/** Phone bottom navigation with router links; active tab follows the URL. Safe-area aware. */
export function TabBar({ items, label }: { items: TabBarItem[]; label: string }) {
  return (
    <nav aria-label={label} className="flex shrink-0 items-start justify-around border-t border-border-1 bg-surface/95 min-h-20.5 pt-2 pb-[env(safe-area-inset-bottom)]">
      {items.map((item) =>
        item.primary ? (
          <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label} className={clsx('-mt-1 flex size-12 touch-manipulation items-center justify-center rounded-full bg-accent text-surface shadow-2', FOCUS_RING)}>
            <Icon name={item.icon} size={22} strokeWidth={2} />
          </NavLink>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => clsx('flex min-h-11 w-15 touch-manipulation flex-col items-center gap-1 rounded-r2 text-xs leading-none font-semibold', FOCUS_RING, isActive ? 'text-ink-1' : 'text-ink-4')}
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} size={21} strokeWidth={isActive ? 2 : 1.6} />
                {item.label}
              </>
            )}
          </NavLink>
        ),
      )}
    </nav>
  )
}
