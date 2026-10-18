import clsx from 'clsx'
import type { MouseEventHandler, ReactNode } from 'react'
import { Link as RouterLink, type To } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'

export type TextLinkTone = 'accent' | 'muted' | 'strong' | 'danger'

const TONES: Record<TextLinkTone, string> = {
  accent: 'font-semibold text-accent-hover',
  muted: 'font-semibold text-ink-3',
  strong: 'font-bold text-ink-1',
  danger: 'font-semibold text-danger',
}

export interface TextLinkProps {
  /** Router route → `<Link>`; `href` → `<a>`; neither → `<button>`. */
  to?: To
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  tone?: TextLinkTone
  size?: 'sm' | 'md'
  icon?: IconName
  iconRight?: IconName
  className?: string
  children: ReactNode
}

/** Text-only action: "See all", "Set default", "Report a problem". */
export function TextLink({ to, href, onClick, tone = 'accent', size = 'sm', icon, iconRight, className, children }: TextLinkProps) {
  const iconSize = size === 'sm' ? 13 : 14
  const cls = clsx(
    'inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-r1 whitespace-nowrap underline-offset-3 hover:underline lg:min-h-0',
    FOCUS_RING,
    TONES[tone],
    size === 'sm' ? 'text-label' : 'text-sm',
    className,
  )
  const body = (
    <>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </>
  )
  if (to !== undefined) return <RouterLink to={to} onClick={onClick} className={cls}>{body}</RouterLink>
  if (href !== undefined) return <a href={href} onClick={onClick} className={cls}>{body}</a>
  return <button type="button" onClick={onClick} className={cls}>{body}</button>
}
