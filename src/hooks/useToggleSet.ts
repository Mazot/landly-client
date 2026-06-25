import { useCallback, useState } from 'react'

/** A Set with immutable toggle/reset helpers — replaces hand-rolled Set state. */
export function useToggleSet<T>(initial: Iterable<T> = []) {
  const [set, setSet] = useState<Set<T>>(() => new Set(initial))

  const toggle = useCallback((value: T) => {
    setSet((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }, [])

  const has = useCallback((value: T) => set.has(value), [set])
  const reset = useCallback(() => setSet(new Set()), [])

  return { set, has, toggle, reset, size: set.size }
}
