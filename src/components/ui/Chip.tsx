import clsx from 'clsx'
import type { ComponentProps } from 'react'
import type { KnownOrganisationTypeSlug } from '@/types/api'
import { ORG_TYPE_CLASSES } from './constants/orgTypes'
import { Icon, type IconName } from './Icon'
import { FOCUS_RING } from './lib/classes'

export interface ChipProps extends ComponentProps<'button'> {
  selected?: boolean
  /** 34 / 30 px on desktop; 44 px hit area on phones. */
  size?: 'md' | 'sm'
  icon?: IconName
  /** Org-type chip: coloured dot; selected → the type's soft colour. */
  orgType?: KnownOrganisationTypeSlug
  /** Dashed "+ Add" chip. */
  add?: boolean
}

/** Toggleable filter / choice pill. Use ChipGroup for a set of them. */
export function Chip({ selected, size = 'md', icon, orgType, add, type = 'button', className, children, ...rest }: ChipProps) {
  const typeCls = orgType && ORG_TYPE_CLASSES[orgType]
  return (
    <button
      type={type}
      aria-pressed={add ? undefined : !!selected}
      className={clsx(
        'inline-flex min-h-11 shrink-0 touch-manipulation items-center gap-1.5 rounded-full border leading-none font-semibold whitespace-nowrap transition-colors lg:min-h-0',
        FOCUS_RING,
        size === 'md' ? 'px-3.25 text-label lg:h-8.5' : 'px-2.75 text-xs lg:h-7.5',
        add
          ? 'border-dashed border-border-2 bg-surface text-ink-3 hover:bg-surface-2'
          : selected && typeCls
            ? ['border-transparent', typeCls.soft, typeCls.text]
            : selected
              ? 'border-ink-1 bg-ink-1 text-surface'
              : 'border-border-1 bg-surface text-ink-2 hover:border-border-2 hover:bg-surface-2',
        className,
      )}
      {...rest}
    >
      {typeCls && <span className={clsx('size-2 rounded-full', typeCls.dot)} />}
      {(icon ?? add) && <Icon name={icon ?? 'plus'} size={12} strokeWidth={2} />}
      {selected && !typeCls && !icon && <Icon name="check" size={12} strokeWidth={2.4} />}
      {children}
    </button>
  )
}
