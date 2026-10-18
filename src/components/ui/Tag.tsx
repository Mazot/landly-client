import clsx from 'clsx'
import type { KnownOrganisationTypeSlug } from '@/types/api'
import { useTranslation } from 'react-i18next'
import { ORG_TYPE_CLASSES } from './constants/orgTypes'
import { UI_NS } from './i18n'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'

export interface TagProps {
  children: string
  size?: 'sm' | 'md'
  icon?: IconName
  /** Coloured dot of an org type. */
  orgType?: KnownOrganisationTypeSlug
  /** Shows a remove button (editing languages, services). */
  onRemove?: () => void
  className?: string
}

/** Static label for services, languages and skills. 28 / 32 px. */
export function Tag({ children, size = 'sm', icon, orgType, onRemove, className }: TagProps) {
  const { t } = useTranslation(UI_NS)
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-surface leading-none whitespace-nowrap',
        size === 'md' || onRemove ? 'h-8 text-label' : 'h-7 text-label',
        onRemove ? 'border-border-2 pr-1 pl-3.5 font-semibold text-ink-1' : 'border-border-1 px-3 font-medium text-ink-2',
        className,
      )}
    >
      {orgType && <span className={clsx('size-1.75 rounded-full', ORG_TYPE_CLASSES[orgType].dot)} />}
      {icon && <Icon name={icon} size={13} />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('remove', { label: children })}
          className={clsx('-my-1.5 -mr-2 inline-flex size-11 touch-manipulation items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink-1 lg:my-0 lg:mr-0 lg:size-5.5', FOCUS_RING)}
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </span>
  )
}
