import { createContext, useContext, useState } from 'react'

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

/** "Anna Morozova" → "AM". */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
