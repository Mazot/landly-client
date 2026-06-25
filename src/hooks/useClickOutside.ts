import { useEffect, type RefObject } from 'react'

/**
 * Calls `handler` on a pointer-down outside `ref`. The ref should wrap both the
 * trigger and the floating content so clicking the trigger doesn't self-close.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return
    const onPointerDown = (e: MouseEvent) => {
      const el = ref.current
      if (el && !el.contains(e.target as Node)) handler()
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [ref, handler, enabled])
}
