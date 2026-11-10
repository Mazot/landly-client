import clsx from 'clsx'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { FOCUS_RING } from '../lib/classes'

export interface DockedSheetProps {
  /** Tall (most of the screen) instead of peeking. */
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** Accessible name of the handle: "Show the list" / "Hide the list". */
  handleLabel: string
  /** Pinned row under the handle (count, sort). */
  header?: ReactNode
  /** Scrolling content. */
  children: ReactNode
}

/** Pixels the handle must travel for a swipe; less is a tap. */
const SWIPE = 32

/**
 * Bottom sheet that stays on screen (not modal): peeks over the map and grows when the handle is
 * tapped or swiped. Put it inside a `relative` parent — it docks to the parent's bottom edge.
 */
export function DockedSheet({ expanded, onExpandedChange, handleLabel, header, children }: DockedSheetProps) {
  const startY = useRef<number | null>(null)
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    startY.current = event.clientY
  }
  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const travelled = event.clientY - (startY.current ?? event.clientY)
    startY.current = null
    // A swipe up opens, a swipe down closes; a tap toggles.
    onExpandedChange(Math.abs(travelled) >= SWIPE ? travelled < 0 : !expanded)
  }
  return (
    <section
      className={clsx(
        'absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-r4 bg-surface shadow-pop transition-[height] duration-200 motion-reduce:transition-none',
        expanded ? 'h-4/5' : 'h-72',
      )}
    >
      <button
        type="button"
        aria-label={handleLabel}
        aria-expanded={expanded}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        // Keyboard and assistive tech click without a pointer: toggle then.
        onClick={(event) => event.detail === 0 && onExpandedChange(!expanded)}
        className={clsx('flex h-11 w-full shrink-0 cursor-grab touch-none items-center justify-center rounded-t-r4', FOCUS_RING)}
      >
        <span aria-hidden="true" className="h-1.25 w-10 rounded-full bg-border-2" />
      </button>
      {header && <div className="shrink-0 px-5 pb-2">{header}</div>}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5">{children}</div>
    </section>
  )
}
