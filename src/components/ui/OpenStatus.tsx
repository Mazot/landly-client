import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { UI_NS } from './i18n'

export interface OpenStatusProps {
  /** `Organisation.openNow`; `null` (unknown hours) renders nothing. */
  open: boolean | null
  /** Today's hours, already formatted: "until 18:00". */
  hours?: string
  size?: 'sm' | 'md'
}

/** "● Open now · until 18:00" from the server-computed `openNow`. */
export function OpenStatus({ open, hours, size = 'md' }: OpenStatusProps) {
  const { t } = useTranslation(UI_NS)
  if (open === null) return null
  return (
    <span className={clsx('inline-flex items-center gap-1.5 leading-none font-semibold whitespace-nowrap', size === 'sm' ? 'text-xs' : 'text-label', open ? 'text-success' : 'text-ink-3')}>
      <span className={clsx('size-1.5 rounded-full', open ? 'bg-success' : 'bg-ink-4')} />
      <span>{open ? t('openNow') : t('closed')}</span>
      {hours && <span className="font-medium text-ink-3">· {hours}</span>}
    </span>
  )
}
