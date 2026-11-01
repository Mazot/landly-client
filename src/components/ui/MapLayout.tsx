import type { ReactNode } from 'react'
import { Button } from './DS/Button'
import { Sheet } from './DS/Sheet'

export interface MapLayoutProps {
  /** Usually a `<TopBar>`. */
  topBar: ReactNode
  /** The map; fills the whole area. */
  map: ReactNode
  /** Heading of the results panel / sheet. */
  title: string
  /** Results list. */
  panel: ReactNode
  /** Label of the phone button that opens the results ("12 places in this area"). */
  summary: string
  /** Phone results sheet (below `lg` the panel is a bottom sheet). */
  sheetOpen: boolean
  onSheetOpenChange: (open: boolean) => void
}

/**
 * Full-height map screen: map with a results side panel from `lg`; on phones a
 * full-bleed map with a button that opens the results as a bottom sheet.
 */
export function MapLayout({ topBar, map, title, panel, summary, sheetOpen, onSheetOpenChange }: MapLayoutProps) {
  return (
    <div className="flex h-dvh flex-col bg-bg">
      {topBar}
      <div className="flex min-h-0 flex-1">
        <aside aria-label={title} className="hidden w-96 shrink-0 flex-col overflow-hidden border-r border-border-1 bg-surface lg:flex">
          <h1 className="m-0 px-5 pt-5 pb-3 text-lg leading-tight font-bold text-ink-1">{title}</h1>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">{panel}</div>
        </aside>
        <main className="relative min-w-0 flex-1">
          <div className="absolute inset-0">{map}</div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden">
            <div className="pointer-events-auto">
              <Button variant="primary" icon="pin" onClick={() => onSheetOpenChange(true)}>
                {summary}
              </Button>
            </div>
          </div>
        </main>
      </div>
      <Sheet open={sheetOpen} onClose={() => onSheetOpenChange(false)} title={title}>
        {sheetOpen && <div className="pb-4">{panel}</div>}
      </Sheet>
    </div>
  )
}
