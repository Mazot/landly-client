import clsx from 'clsx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MAX_RATING, MIN_RATING } from '@/types/api'
import { UI_NS } from './i18n'
import { Icon } from './Icon'
import { FOCUS_RING } from './lib/classes'
import { onRadioGroupKeyDown, radioTabIndex, useControllableState } from './lib/internal'

export interface StarInputProps {
  /** 1–5 (`MIN_RATING`–`MAX_RATING`); 0 = nothing chosen. */
  value?: number
  defaultValue?: number
  onChange?: (rating: number) => void
  /** Accessible name of the group. */
  label: string
  size?: 'md' | 'lg'
}

const STEPS = Array.from({ length: MAX_RATING - MIN_RATING + 1 }, (_, i) => MIN_RATING + i)

/** Rating picker for `POST /review/create`, with hover preview. 44 / 48 px. */
export function StarInput({ value, defaultValue = 0, onChange, label, size = 'lg' }: StarInputProps) {
  const { t } = useTranslation(UI_NS)
  const [rating, setRating] = useControllableState(value, defaultValue, onChange)
  const [hover, setHover] = useState(0)
  const shown = hover || rating
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-2" onPointerLeave={() => setHover(0)} onKeyDown={(e) => onRadioGroupKeyDown(e, (i) => setRating(STEPS[i]))}>
      {STEPS.map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={rating === i}
          aria-label={t('stars', { count: i })}
          tabIndex={radioTabIndex(STEPS.indexOf(i), STEPS.indexOf(rating))}
          // Preview only for a real hover: a touch tap fires enter without a matching leave.
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
          onClick={() => setRating(i)}
          className={clsx(
            'inline-flex touch-manipulation items-center justify-center rounded-r3 border border-border-1 transition-colors',
            FOCUS_RING,
            size === 'lg' ? 'size-12' : 'size-11',
            i <= shown ? 'bg-star-soft' : 'bg-surface',
          )}
        >
          <Icon name="star" size={size === 'lg' ? 22 : 20} filled={i <= shown} className="text-star" />
        </button>
      ))}
    </div>
  )
}
