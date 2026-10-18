import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { UI_NS } from './i18n'
import { Icon } from './Icon'

/** Five stars filled up to the rounded `value` (review lists, rating summary). */
export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  const { t } = useTranslation(UI_NS)
  const filled = Math.round(value)
  return (
    <span role="img" aria-label={t('ratingOutOf', { value })} className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={size} strokeWidth={1.4} filled={i <= filled} className={clsx(i <= filled ? 'text-star' : 'text-border-2')} />
      ))}
    </span>
  )
}
