/**
 * AppShell — outer page shell shared by all full-height app pages.
 *
 * Slots:
 *   children  — flexible content (StickySection, ScrollArea, etc.)
 *   footer    — fixed bottom slot (MessageComposer, CTA bars). Rendered BEFORE
 *               MobileBottomNav so composer sits above the nav tabs on mobile.
 *
 * Responsive:
 *   showBottomNav renders MobileBottomNav wrapped in md:hidden — it disappears
 *   at tablet+ where the TopBar already has nav links.
 */
import type { CSSProperties, ReactNode } from 'react'
import TopBar from '@/components/ui/TopBar'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'

interface AppShellProps {
  /** Include the global TopBar. Default true. Set false when the page has its own header (Messages, Thread). */
  showTopBar?: boolean
  /** Render MobileBottomNav (md:hidden). Default true. Set false for detail/thread pages. */
  showBottomNav?: boolean
  /** Fixed-bottom slot — rendered above MobileBottomNav. Useful for MessageComposer, action bars. */
  footer?: ReactNode
  /** Page background. Default var(--bg). */
  background?: string
  style?: CSSProperties
  children: ReactNode
}

export default function AppShell({
  showTopBar = true,
  showBottomNav = true,
  footer,
  background = 'var(--bg)',
  style,
  children,
}: AppShellProps) {
  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', background, overflow: 'hidden', ...style }}
    >
      {showTopBar && <TopBar />}
      {children}
      {footer}
      {showBottomNav && (
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      )}
    </div>
  )
}
