import clsx from 'clsx'
import { useContext, type KeyboardEvent, type MouseEventHandler, type ReactNode } from 'react'
import { Link as RouterLink, type To } from 'react-router-dom'
import { FOCUS_RING } from './lib/classes'
import { DividedListContext } from './lib/internal'

export interface ListItemProps {
  /** Avatar, IconTile, flag. */
  leading?: ReactNode
  /** Truncated to one line. */
  title: ReactNode
  /** Right after the title (verified icon). */
  adornment?: ReactNode
  subtitle?: ReactNode
  /** Row of tags / rating / distance; aligns the row to the top. */
  meta?: ReactNode
  /** Badge, chevron, Switch, bookmark. */
  trailing?: ReactNode
  /** Full-width block under the row (moderator note). */
  footer?: ReactNode
  /** `card` — standalone white card; `plain` — transparent row. */
  variant?: 'plain' | 'card'
  size?: 'md' | 'sm'
  align?: 'center' | 'top'
  /** Selected row (map list, moderation queue). */
  active?: boolean
  /** Router route → link row; `href` → anchor row; `onClick` → button row. */
  to?: To
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  className?: string
}

/** Leading + title + subtitle/meta + trailing — places, people, queue items, missions, saved items. */
export function ListItem({ leading, title, adornment, subtitle, meta, trailing, footer, variant = 'plain', size = 'md', align, active, to, href, onClick, className }: ListItemProps) {
  const divided = useContext(DividedListContext)
  const top = (align ?? (meta ? 'top' : 'center')) === 'top'
  const interactive = to !== undefined || href !== undefined || onClick !== undefined
  const cls = clsx(
    'block min-w-0 text-left text-inherit no-underline',
    divided ? 'px-4 py-3' : ['rounded-r3 border', size === 'sm' ? 'p-3' : 'p-3.5'],
    !divided && (active ? 'border-ink-1 bg-surface shadow-2' : variant === 'card' ? 'border-border-1 bg-surface shadow-1' : 'border-transparent'),
    interactive && ['cursor-pointer touch-manipulation transition-colors', FOCUS_RING],
    interactive && !active && (variant === 'card' && !divided ? 'hover:border-border-2' : 'hover:bg-surface-2'),
    className,
  )
  const body = (
    <>
      <div className={clsx('flex min-w-0 gap-3', top ? 'items-start' : 'items-center')}>
        {leading}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5 text-sm leading-tight font-bold text-ink-1">
            <span className="truncate">{title}</span>
            {adornment}
          </div>
          {subtitle && <div className="mt-1 text-label font-medium text-ink-3">{subtitle}</div>}
          {meta && <div className="mt-1.75 flex flex-wrap items-center gap-1.75">{meta}</div>}
        </div>
        {trailing && <div className="flex shrink-0 items-center gap-2 text-ink-4">{trailing}</div>}
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </>
  )
  if (to !== undefined) return <RouterLink to={to} onClick={onClick} aria-current={active ? 'true' : undefined} className={cls}>{body}</RouterLink>
  if (href !== undefined) return <a href={href} onClick={onClick} aria-current={active ? 'true' : undefined} className={cls}>{body}</a>
  if (onClick) {
    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.currentTarget.click()
      }
    }
    return <div role="button" tabIndex={0} aria-pressed={active} onClick={onClick} onKeyDown={onKeyDown} className={cls}>{body}</div>
  }
  return <div className={cls}>{body}</div>
}
