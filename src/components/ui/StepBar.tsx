import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { UI_NS } from './i18n'

/** Segmented step indicator of a multi-step form (sign-up: 2 steps). */
export function StepBar({ total, current, className }: { total: number; current: number; className?: string }) {
  const { t } = useTranslation(UI_NS)
  return (
    <div role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-label={t('stepOf', { current, total })} className={clsx('flex gap-1.5', className)}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={clsx('h-1 flex-1 rounded-full', i < current ? 'bg-accent' : 'bg-border-1')} />
      ))}
    </div>
  )
}
