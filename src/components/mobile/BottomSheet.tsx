import { useRef, useCallback, type ReactNode } from 'react'

export type SheetState = 'peek' | 'open'

interface BottomSheetProps {
  state: SheetState
  onStateChange: (s: SheetState) => void
  peekHeight?: number
  children: ReactNode
  className?: string
}

export default function BottomSheet({
  state,
  onStateChange,
  peekHeight = 200,
  children,
}: BottomSheetProps) {
  const dragStart = useRef<number | null>(null)
  const startHeight = useRef<number>(peekHeight)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      dragStart.current = e.clientY
      startHeight.current = state === 'peek' ? peekHeight : window.innerHeight * 0.75
    },
    [state, peekHeight]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragStart.current === null) return
      const delta = dragStart.current - e.clientY
      dragStart.current = null
      // Swipe up > 40px → open; swipe down > 40px → peek
      if (delta > 40) onStateChange('open')
      else if (delta < -40) onStateChange('peek')
    },
    [onStateChange]
  )

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--surface)',
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -8px 40px rgba(20,18,14,0.13)',
        border: '1px solid var(--border-1)',
        borderBottom: 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: state === 'peek' ? peekHeight : '75vh',
        transition: 'height 0.3s cubic-bezier(0.32,0,0.67,0)',
        touchAction: 'none',
      }}
    >
      {/* drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px', cursor: 'grab', flexShrink: 0 }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-2)' }} />
      </div>
      {children}
    </div>
  )
}
