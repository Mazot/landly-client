import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BACKDROP_VIEW, GOOGLE_MAPS_MAP_ID } from '@/lib/maps'
import { setViewportWidth } from '@/test/viewport'
import { MapBackdrop } from '../MapBackdrop'
import { CorridorBubble } from '../CorridorBubble'
import { CorridorPill } from '../CorridorPill'
import { DockedSheet } from '../DS/DockedSheet'
import { MapLayout } from '../MapLayout'
import { MapPin } from '../MapPin'
import { VerifiedMark } from '../VerifiedMark'

// The map itself is a stand-in that shows the props it was given; `useMap` is steered per test.
vi.mock('@vis.gl/react-google-maps', async () => {
  const { createElement } = await import('react')
  return {
    Map: ({ children, defaultCenter, defaultZoom, gestureHandling, disableDefaultUI, isFractionalZoomEnabled, className, mapId }: Record<string, unknown> & { children?: ReactNode }) =>
      createElement('div', { 'data-testid': 'google-map', className: className as string, 'data-props': JSON.stringify({ defaultCenter, defaultZoom, gestureHandling, disableDefaultUI, isFractionalZoomEnabled, mapId }) }, children),
  }
})

describe('MapPin', () => {
  it('is an image named after the place, in its seeded type colour', () => {
    render(<MapPin slug="embassy" label="Russian Embassy" />)
    expect(screen.getByRole('img', { name: 'Russian Embassy' })).toHaveClass('bg-type-embassy')
  })

  it('takes the server colour for a custom type', () => {
    render(<MapPin slug="other" color="#123456" label="Choir" />)
    const pin = screen.getByRole('img', { name: 'Choir' })
    expect(pin).toHaveStyle({ backgroundColor: '#123456' })
    expect(pin).not.toHaveClass('bg-ink-3')
  })

  it('is neutral without a type or a colour', () => {
    render(<MapPin slug={null} label="Somewhere" />)
    const pin = screen.getByRole('img', { name: 'Somewhere' })
    expect(pin).toHaveClass('bg-ink-3')
    expect(pin).not.toHaveAttribute('style')
  })

  it('is muted, and says so, while the place waits for moderation', () => {
    const { rerender } = render(<MapPin slug="business" label="Neka" />)
    expect(screen.getByRole('img', { name: 'Neka' })).not.toHaveClass('brightness-75')
    rerender(<MapPin slug="business" label="Neka" pending />)
    const pin = screen.getByRole('img', { name: 'Neka · Pending review' })
    // Still the type's colour, darker and duller.
    expect(pin).toHaveClass('bg-type-business', 'brightness-75', 'saturate-50')
  })

  it('grows with a ring when selected', () => {
    const { rerender } = render(<MapPin slug="helper" label="Helper" />)
    expect(screen.getByRole('img')).not.toHaveClass('scale-150')
    rerender(<MapPin slug="helper" label="Helper" selected />)
    expect(screen.getByRole('img')).toHaveClass('scale-150', 'ring-2')
  })
})

describe('MapPin', () => {
  it('shows the place name above the pin only while selected', () => {
    const { rerender } = render(<MapPin slug="embassy" label="Russian Embassy" />)
    expect(screen.queryByText('Russian Embassy')).not.toBeInTheDocument()
    rerender(<MapPin slug="embassy" label="Russian Embassy" selected />)
    // The pin is named for assistive tech already; the visible pill is decoration.
    expect(screen.getByText('Russian Embassy')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('img', { name: 'Russian Embassy' })).toBeInTheDocument()
  })
})

describe('VerifiedMark', () => {
  it('is an image named Verified', () => {
    render(<VerifiedMark />)
    expect(screen.getByRole('img', { name: 'Verified' })).toBeInTheDocument()
  })
})

describe('CorridorPill', () => {
  it('shows the flags and the destination and opens the picker', async () => {
    const onClick = vi.fn()
    render(<CorridorPill from="🇷🇺" to="🇩🇪" label="Russia → Germany" name="Germany" onClick={onClick} />)
    const pill = screen.getByRole('button', { name: /Germany/ })
    expect(pill).toHaveAttribute('aria-haspopup', 'dialog')
    expect(within(pill).getByRole('img', { name: 'Russia → Germany' })).toBeInTheDocument()
    expect(pill).toHaveClass('bg-surface-2')
    await userEvent.click(pill)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('has a dark variant for floating over the map', () => {
    render(<CorridorPill dark from="🇷🇺" to="🇩🇪" label="Russia → Germany" name="Germany" />)
    expect(screen.getByRole('button')).toHaveClass('bg-ink-1')
  })
})

describe('CorridorBubble', () => {
  it('summarises the corridor and opens the picker', async () => {
    const onClick = vi.fn()
    render(<CorridorBubble from="🇷🇺" to="🇩🇪" label="Russia → Germany" title="234 places" detail="4 embassies · 12 new this week" onClick={onClick} />)
    const bubble = screen.getByRole('button', { name: /234 places/ })
    expect(within(bubble).getByText('4 embassies · 12 new this week')).toBeInTheDocument()
    await userEvent.click(bubble)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('works without the detail line', () => {
    render(<CorridorBubble from="🇷🇺" to="🇩🇪" label="Russia → Germany" title="234 places" />)
    expect(screen.getByText('234 places')).toBeInTheDocument()
    expect(screen.queryByText(/embassies/)).not.toBeInTheDocument()
  })
})

describe('DockedSheet', () => {
  const sheet = (expanded: boolean, onExpandedChange = vi.fn()) => (
    <DockedSheet expanded={expanded} onExpandedChange={onExpandedChange} handleLabel="Show the list" header={<b>48 nearby</b>}>
      <p>Rows</p>
    </DockedSheet>
  )

  it('peeks or stands tall, with its header and content', () => {
    const { container, rerender } = render(sheet(false))
    expect(screen.getByText('48 nearby')).toBeInTheDocument()
    expect(screen.getByText('Rows')).toBeInTheDocument()
    expect(container.querySelector('section')).toHaveClass('h-72')
    expect(screen.getByRole('button', { name: 'Show the list' })).toHaveAttribute('aria-expanded', 'false')
    rerender(sheet(true))
    expect(container.querySelector('section')).toHaveClass('h-4/5')
    expect(screen.getByRole('button', { name: 'Show the list' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('works without a header', () => {
    render(
      <DockedSheet expanded={false} onExpandedChange={() => {}} handleLabel="Handle">
        <p>Rows</p>
      </DockedSheet>,
    )
    expect(screen.getByText('Rows')).toBeInTheDocument()
  })

  it('keeps a swipe when the pointer leaves the handle, and drops it when the browser cancels it', () => {
    const onExpandedChange = vi.fn()
    render(sheet(false, onExpandedChange))
    const handle = screen.getByRole('button', { name: 'Show the list' })
    const setPointerCapture = vi.fn()
    Object.assign(handle, { setPointerCapture })
    fireEvent.pointerDown(handle, { pointerId: 7, clientY: 300 })
    expect(setPointerCapture).toHaveBeenCalledWith(7)
    fireEvent.pointerCancel(handle, { pointerId: 7 })
    // The cancelled swipe is forgotten: a stray release is a plain tap, not a 260 px swipe down.
    fireEvent.pointerUp(handle, { pointerId: 7, clientY: 40 })
    expect(onExpandedChange).toHaveBeenLastCalledWith(true)
  })

  it('toggles on a tap', async () => {
    const onExpandedChange = vi.fn()
    const { rerender } = render(sheet(false, onExpandedChange))
    await userEvent.click(screen.getByRole('button', { name: 'Show the list' }))
    expect(onExpandedChange).toHaveBeenLastCalledWith(true)
    rerender(sheet(true, onExpandedChange))
    await userEvent.click(screen.getByRole('button', { name: 'Show the list' }))
    expect(onExpandedChange).toHaveBeenLastCalledWith(false)
  })

  it('opens on a swipe up and closes on a swipe down', () => {
    const onExpandedChange = vi.fn()
    render(sheet(false, onExpandedChange))
    const handle = screen.getByRole('button', { name: 'Show the list' })
    fireEvent.pointerDown(handle, { clientY: 400 })
    fireEvent.pointerUp(handle, { clientY: 300 })
    expect(onExpandedChange).toHaveBeenLastCalledWith(true)
    fireEvent.pointerDown(handle, { clientY: 300 })
    fireEvent.pointerUp(handle, { clientY: 420 })
    expect(onExpandedChange).toHaveBeenLastCalledWith(false)
  })

  it('treats a release without a press on the handle as a tap', () => {
    const onExpandedChange = vi.fn()
    render(sheet(false, onExpandedChange))
    fireEvent.pointerUp(screen.getByRole('button', { name: 'Show the list' }), { clientY: 200 })
    expect(onExpandedChange).toHaveBeenLastCalledWith(true)
  })

  it('toggles from the keyboard, where a click has no pointer', async () => {
    const onExpandedChange = vi.fn()
    render(sheet(false, onExpandedChange))
    screen.getByRole('button', { name: 'Show the list' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(onExpandedChange).toHaveBeenCalledOnce()
    expect(onExpandedChange).toHaveBeenLastCalledWith(true)
  })
})

describe('MapLayout', () => {
  const layout = (props: Partial<Parameters<typeof MapLayout>[0]> = {}) => (
    <MapLayout
      toolbar={<input aria-label="Search" />}
      map={<div>The map</div>}
      overlay={<div>Floating controls</div>}
      resultsHeader={<h2>48 organizations</h2>}
      results={<ul><li>Cafe Berlin</li></ul>}
      resultsLabel="Places on the map"
      sheetExpanded={false}
      onSheetExpandedChange={() => {}}
      sheetHandleLabel="Show the list"
      {...props}
    />
  )

  it('desktop: a toolbar bar, the results panel on the left and the map on the right', () => {
    render(layout())
    const panel = screen.getByRole('complementary', { name: 'Places on the map' })
    expect(within(panel).getByText('48 organizations')).toBeInTheDocument()
    expect(within(panel).getByText('Cafe Berlin')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByText('The map')).toBeInTheDocument()
    expect(screen.getByText('Floating controls')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show the list' })).not.toBeInTheDocument()
  })

  it('tablet: the map with the results below it', () => {
    setViewportWidth(834)
    render(layout())
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    const results = screen.getByRole('region', { name: 'Places on the map' })
    expect(within(results).getByText('48 organizations')).toBeInTheDocument()
    expect(within(results).getByText('Cafe Berlin')).toBeInTheDocument()
    expect(screen.getByText('The map')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show the list' })).not.toBeInTheDocument()
  })

  it('phone: the toolbar floats over the map and the results sit in a docked sheet', async () => {
    setViewportWidth(375)
    const onSheetExpandedChange = vi.fn()
    render(layout({ onSheetExpandedChange }))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByText('The map')).toBeInTheDocument()
    expect(screen.getByText('Floating controls')).toBeInTheDocument()
    const results = screen.getByRole('region', { name: 'Places on the map' })
    expect(within(results).getByText('Cafe Berlin')).toBeInTheDocument()
    expect(screen.getByText('48 organizations')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Show the list' }))
    expect(onSheetExpandedChange).toHaveBeenCalledWith(true)
  })

  it('renders the results once, whatever the size', () => {
    for (const width of [375, 834, 1440]) {
      setViewportWidth(width)
      const { unmount } = render(layout())
      expect(screen.getAllByText('Cafe Berlin')).toHaveLength(1)
      unmount()
    }
  })

  it('works without an overlay', () => {
    render(layout({ overlay: undefined }))
    expect(screen.queryByText('Floating controls')).not.toBeInTheDocument()
  })
})

/** IntersectionObserver whose visibility a test sets by hand. */
class FakeObserver {
  static instances: FakeObserver[] = []
  disconnected = false
  constructor(private callback: IntersectionObserverCallback) {
    FakeObserver.instances.push(this)
  }
  observe() {}
  disconnect() {
    this.disconnected = true
  }
  show(isIntersecting: boolean) {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }
}

describe('MapBackdrop', () => {
  beforeEach(() => {
    FakeObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('is a decorative, className-sized block that ignores the pointer', () => {
    const { container } = render(<MapBackdrop className="h-80" />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveClass('h-80', 'bg-country-water', 'pointer-events-none')
  })

  it('mounts a still, chrome-less map at the fixed view only while it is on screen', () => {
    render(<MapBackdrop />)
    expect(screen.queryByTestId('google-map')).not.toBeInTheDocument()

    act(() => FakeObserver.instances[0].show(true))
    const map = screen.getByTestId('google-map')
    expect(JSON.parse(map.dataset.props!)).toEqual({ defaultCenter: BACKDROP_VIEW.center, defaultZoom: BACKDROP_VIEW.zoom, gestureHandling: 'none', disableDefaultUI: true, isFractionalZoomEnabled: true, mapId: GOOGLE_MAPS_MAP_ID })

    act(() => FakeObserver.instances[0].show(false))
    expect(screen.queryByTestId('google-map')).not.toBeInTheDocument()
  })

  it('stops watching the screen when it unmounts', () => {
    const { unmount } = render(<MapBackdrop />)
    unmount()
    expect(FakeObserver.instances[0].disconnected).toBe(true)
  })

  it('adds the dimming and the readability fade only for the hero variant', () => {
    const { container, rerender } = render(<MapBackdrop />)
    expect(container.querySelector('.bg-linear-to-r')).toBeNull()
    expect(container.querySelector('.bg-bg\\/78')).toBeNull()
    rerender(<MapBackdrop variant="hero" />)
    expect(container.querySelector('.bg-linear-to-r')).not.toBeNull()
    expect(container.querySelector('.bg-bg\\/78')).not.toBeNull()
    // Both overlays fade out at the bottom, where Google's logo and copyright sit.
    expect(container.querySelectorAll('.mask-b-from-80\\%')).toHaveLength(2)
  })
})
