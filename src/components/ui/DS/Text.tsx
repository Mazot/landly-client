import clsx from 'clsx'
import type { ReactNode } from 'react'

export type TextSize = 'md' | 'sm' | 'label' | 'xs'
export type TextTone = 'strong' | 'body' | 'muted' | 'faint' | 'danger'
export type TextWeight = 'medium' | 'semibold' | 'bold'

const SIZES: Record<TextSize, string> = { md: 'text-md', sm: 'text-sm', label: 'text-label', xs: 'text-xs' }
const TONES: Record<TextTone, string> = {
  strong: 'text-ink-1',
  body: 'text-ink-2',
  muted: 'text-ink-3',
  faint: 'text-ink-4',
  danger: 'text-danger',
}
const WEIGHTS: Record<TextWeight, string> = { medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' }

export interface TextProps {
  /** `p` (default) for a paragraph, `span` inside a line, `div` around inline blocks. */
  as?: 'p' | 'span' | 'div'
  /** md 15 · sm 14 (default) · label 13 · xs 12 px. */
  size?: TextSize
  /** strong (ink-1) · body (ink-2, default) · muted (ink-3) · faint (ink-4) · danger. */
  tone?: TextTone
  weight?: TextWeight
  align?: 'start' | 'center'
  /** One line, cut with an ellipsis (give the parent `min-w-0`). */
  truncate?: boolean
  /** Layout only (margins, width, padding). */
  className?: string
  children: ReactNode
}

/** Body copy, captions and secondary lines: a description, a review, "No reviews yet", "2 days ago". */
export function Text({ as: As = 'p', size = 'sm', tone = 'body', weight = 'medium', align = 'start', truncate, className, children }: TextProps) {
  return (
    <As className={clsx('m-0', SIZES[size], TONES[tone], WEIGHTS[weight], align === 'center' && 'text-center', truncate ? 'truncate' : 'text-pretty', className)}>
      {children}
    </As>
  )
}
