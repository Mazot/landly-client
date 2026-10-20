import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import type { KnownOrganisationTypeSlug } from '@/types/api'
import { Chip } from './Chip'
import { UI_NS } from './i18n'
import type { IconName } from './Icon'
import { useControllableState } from './lib/internal'

export interface ChipOption<T extends string = string> {
  value: T
  label: string
  icon?: IconName
  orgType?: KnownOrganisationTypeSlug
}

interface CommonProps<T extends string> {
  options: ChipOption<T>[]
  /** Accessible name of the group. */
  label: string
  size?: 'md' | 'sm'
  /** Shows a dashed "+ Add" chip. */
  onAdd?: () => void
  addLabel?: string
  /** One line with horizontal scroll instead of wrapping (map type rail). */
  scroll?: boolean
  className?: string
}
interface SingleProps<T extends string> extends CommonProps<T> {
  multiple?: false
  value?: T | null
  defaultValue?: T | null
  onChange?: (value: T) => void
}
interface MultipleProps<T extends string> extends CommonProps<T> {
  multiple: true
  value?: T[]
  defaultValue?: T[]
  onChange?: (value: T[]) => void
}
export type ChipGroupProps<T extends string> = SingleProps<T> | MultipleProps<T>

const toList = <T,>(v: T | T[] | null | undefined): T[] | undefined => (v === undefined ? undefined : v === null ? [] : Array.isArray(v) ? v : [v])

/** Set of chips with single or multiple selection — filters, languages, skills, lists. */
export function ChipGroup<T extends string>(props: ChipGroupProps<T>) {
  const { options, label, size, onAdd, addLabel, scroll, className } = props
  const { t } = useTranslation(UI_NS)
  const [list, setSelected] = useControllableState<T[]>(toList(props.value), toList(props.defaultValue) ?? [], (next) => {
    if (props.multiple) props.onChange?.(next)
    else props.onChange?.(next[0])
  })
  const toggle = (value: T) => {
    if (!props.multiple) setSelected([value])
    else setSelected(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }
  return (
    <div role="group" aria-label={label} className={clsx('flex gap-1.75', scroll ? 'flex-nowrap overflow-x-auto' : 'flex-wrap', className)}>
      {options.map((o) => (
        <Chip key={o.value} size={size} icon={o.icon} orgType={o.orgType} selected={list.includes(o.value)} onClick={() => toggle(o.value)}>
          {o.label}
        </Chip>
      ))}
      {onAdd && (
        <Chip size={size} add onClick={onAdd}>
          {addLabel ?? t('add')}
        </Chip>
      )}
    </div>
  )
}
