/**
 * TwoColumnLayout — responsive grid for detail pages.
 *
 * Mobile  (< 834px)  : single column — sidebar rendered below children
 * Tablet+ (≥ 834px)  : [1fr  300px] grid
 * Desktop (≥ 1280px) : [1fr  380px] grid
 *
 * The left column (children) scrolls independently; the sidebar column is sticky.
 * Wrap this inside an AppShell or a scrollable outer container.
 */
import type { CSSProperties, ReactNode } from 'react'

interface TwoColumnLayoutProps {
  /** Right-side panel content (contact card, related items, etc.) */
  sidebar: ReactNode
  /** Top offset for sidebar sticky positioning — matches sticky header height. Default 0. */
  sidebarStickyTop?: number
  /** Extra padding around the main column. */
  mainPadding?: string | number
  children: ReactNode
  style?: CSSProperties
}

export default function TwoColumnLayout({
  sidebar,
  sidebarStickyTop = 0,
  mainPadding,
  children,
  style,
}: TwoColumnLayoutProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-[1fr_300px] xl:grid-cols-[1fr_380px]"
      style={{ flex: 1, minHeight: 0, ...style }}
    >
      {/* Main column — scrolls */}
      <div
        className="l-scroll"
        style={{ overflowY: 'auto', ...(mainPadding ? { padding: mainPadding } : {}) }}
      >
        {children}
      </div>

      {/* Sidebar — tablet+ only, sticky */}
      <div
        className="hidden md:block l-scroll"
        style={{
          overflowY: 'auto',
          position: 'sticky',
          top: sidebarStickyTop,
          alignSelf: 'flex-start',
          borderLeft: '1px solid var(--border-1)',
        }}
      >
        {sidebar}
      </div>
    </div>
  )
}
