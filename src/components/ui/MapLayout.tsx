import type { ReactNode } from 'react'
import { useBreakpoint } from '@/lib/useBreakpoint'
import { DockedSheet } from './DS/DockedSheet'

export interface MapLayoutProps {
  /** Search and filters: a bar above the map from `md`, floating over the map on phones. */
  toolbar: ReactNode
  /** The map; fills its area. */
  map: ReactNode
  /** Controls floating over the map (search this area, corridor summary, zoom) — positioned by the page. */
  overlay?: ReactNode
  /** Heading of the results: count, sort. */
  resultsHeader: ReactNode
  /** The results list; scrolls on its own. */
  results: ReactNode
  /** Accessible name of the results region. */
  resultsLabel: string
  /** Phone: the results sheet is tall instead of peeking. */
  sheetExpanded: boolean
  onSheetExpandedChange: (expanded: boolean) => void
  /** Phone: accessible name of the sheet handle. */
  sheetHandleLabel: string
}

/**
 * Map screen below the app bar. Desktop: toolbar, results panel on the left, map on the right.
 * Tablet: toolbar, map, results list below it. Phone: full-bleed map with the toolbar floating over it
 * and the results in a docked bottom sheet. The results are rendered once, in the place the size needs.
 */
export function MapLayout({ toolbar, map, overlay, resultsHeader, results, resultsLabel, sheetExpanded, onSheetExpandedChange, sheetHandleLabel }: MapLayoutProps) {
  const size = useBreakpoint()

  if (size === 'phone') {
    return (
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">{map}</div>
        {overlay}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col gap-2.5 p-3.5">{toolbar}</div>
        <DockedSheet expanded={sheetExpanded} onExpandedChange={onSheetExpandedChange} handleLabel={sheetHandleLabel} header={resultsHeader}>
          <div role="region" aria-label={resultsLabel}>
            {results}
          </div>
        </DockedSheet>
      </div>
    )
  }

  const bar = <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-b border-border-1 bg-surface px-5 py-2.5 lg:flex-nowrap lg:px-6">{toolbar}</div>
  const mapArea = (
    <div className="relative min-h-0 min-w-0 flex-1">
      <div className="absolute inset-0">{map}</div>
      {overlay}
    </div>
  )

  if (size === 'tablet') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {bar}
        {mapArea}
        <section aria-label={resultsLabel} className="flex min-h-0 flex-1 flex-col border-t border-border-1 bg-bg">
          <div className="shrink-0 px-5 pt-4 pb-3">{resultsHeader}</div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-4">{results}</div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {bar}
      <div className="flex min-h-0 flex-1">
        <aside aria-label={resultsLabel} className="flex w-110 shrink-0 flex-col border-r border-border-1 bg-surface">
          <div className="shrink-0 px-6 pt-4.5 pb-3.5">{resultsHeader}</div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{results}</div>
        </aside>
        {mapArea}
      </div>
    </div>
  )
}
