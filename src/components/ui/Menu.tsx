import clsx from 'clsx'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'

export interface MenuAction {
  label: string
  icon?: IconName
  tone?: 'default' | 'danger'
  onSelect: () => void
}

/**
 * Panel of actions (photo: set primary / delete). Positioning and open state
 * belong to the caller — use the native `popover` attribute or a Sheet on phones.
 */
export function Menu({ items, label, className }: { items: (MenuAction | 'divider')[]; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={clsx('min-w-40 rounded-r3 border border-border-1 bg-surface p-1 shadow-3', className)}>
      {items.map((item, i) =>
        item === 'divider' ? (
          <hr key={i} className="mx-1.5 my-1 h-px border-0 bg-border-1" />
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={item.onSelect}
            className={clsx(
              'flex min-h-11 w-full touch-manipulation items-center gap-2.25 rounded-r2 px-2.5 text-left text-label font-semibold hover:bg-surface-2 lg:min-h-9',
              FOCUS_RING,
              item.tone === 'danger' ? 'text-danger' : 'text-ink-1',
            )}
          >
            {item.icon && <Icon name={item.icon} size={14} />}
            {item.label}
          </button>
        ),
      )}
    </div>
  )
}
