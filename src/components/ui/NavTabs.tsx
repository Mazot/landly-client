import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'

export interface NavTabsItem {
  to: string
  label: string
  icon?: IconName
  end?: boolean
}

/** Top-bar navigation (tablet / desktop). `compact`: inactive items show only their icon. */
export function NavTabs({ items, label, compact }: { items: NavTabsItem[]; label: string; compact?: boolean }) {
  return (
    <nav aria-label={label} className="flex gap-0.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          aria-label={compact ? item.label : undefined}
          className={({ isActive }) =>
            clsx(
              'inline-flex h-11 touch-manipulation items-center gap-1.5 rounded-r2 border px-3 text-label leading-none font-semibold whitespace-nowrap lg:h-9',
              FOCUS_RING,
              isActive ? 'border-border-1 bg-surface-2 text-ink-1' : 'border-transparent text-ink-3 hover:text-ink-1',
            )
          }
        >
          {({ isActive }) => (
            <>
              {compact && item.icon && <Icon name={item.icon} size={15} />}
              {(!compact || isActive) && item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
