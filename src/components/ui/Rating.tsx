import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { UI_NS } from './i18n'
import { Icon } from './Icon'

export interface RatingProps {
  /** `ratingAvg` — null without reviews. */
  value: number | null
  /** `reviewsCount`. */
  count: number
  size?: 'sm' | 'md'
}

/** Compact rating: ★ 4.6 · 148, or "No reviews yet". */
export function Rating({ value, count, size = 'md' }: RatingProps) {
  const { t } = useTranslation(UI_NS)
  const text = size === 'sm' ? 'text-xs' : 'text-label'
  if (value === null || count === 0) return <span className={clsx('font-medium whitespace-nowrap text-ink-4', text)}>{t('noReviews')}</span>
  return (
    <span className={clsx('inline-flex items-center gap-1.5 leading-none font-semibold whitespace-nowrap text-ink-2', text)}>
      <Icon name="star" size={size === 'sm' ? 12 : 13} filled className="text-star" />
      <span>{value.toFixed(1)}</span>
      <span className="font-medium text-ink-3">· {count}</span>
    </span>
  )
}
