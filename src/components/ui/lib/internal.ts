import { Children, createContext, Fragment, isValidElement, useContext, useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react'

/**
 * State that works both controlled (`value` + `onChange`) and uncontrolled
 * (`defaultValue`). `undefined` means "uncontrolled".
 */
export function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  const set = (next: T) => {
    if (!controlled) setInner(next)
    onChange?.(next)
  }
  return [controlled ? value : inner, set] as const
}

/** Wires a control to its `<Field>`: id for the label, describedby for hint/error, invalid state. */
export interface FieldContextValue {
  id: string
  describedBy?: string
  invalid: boolean
}
export const FieldContext = createContext<FieldContextValue | null>(null)
export const useField = () => useContext(FieldContext)

/** Set by `<List variant="divided">` so `ListItem` drops its own card styling. */
export const DividedListContext = createContext(false)

/**
 * "Anna Morozova" → "AM". Takes the first letter or digit of each word (whole code
 * points — no half emoji), skips words without one ("🇩🇪 Club" → "C"); "?" when none.
 */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0])
    .filter((ch): ch is string => !!ch)
    .slice(0, 2)
    .map((ch) => ch.toUpperCase())
    .join('') || '?'

/** Children with fragments unwrapped, so `<>{a}{b}</>` counts as two children. */
export function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement(child) && child.type === Fragment ? flattenChildren((child as ReactElement<{ children?: ReactNode }>).props.children) : [child],
  )
}

/**
 * ARIA radiogroup keyboard pattern: only the checked radio (or the first one when
 * none is checked) is a tab stop; arrows / Home / End move focus and select.
 */
export function radioTabIndex(index: number, checkedIndex: number) {
  return index === (checkedIndex < 0 ? 0 : checkedIndex) ? 0 : -1
}

export function onRadioGroupKeyDown(event: KeyboardEvent<HTMLElement>, select: (index: number) => void) {
  const radios = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')]
  const from = radios.indexOf(event.target as HTMLElement)
  if (from < 0) return
  const last = radios.length - 1
  const to = { ArrowRight: from + 1, ArrowDown: from + 1, ArrowLeft: from - 1, ArrowUp: from - 1, Home: 0, End: last }[event.key]
  if (to === undefined) return
  event.preventDefault()
  const next = to > last ? 0 : to < 0 ? last : to
  radios[next].focus()
  select(next)
}
