import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BACKDROP_VIEW, GOOGLE_MAPS_MAP_ID } from '@/lib/maps'
import { MapBackdrop } from '../MapBackdrop'
import { MapLayout } from '../MapLayout'
import { MapPin } from '../MapPin'

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

  it('grows with a ring when selected', () => {
    const { rerender } = render(<MapPin slug="helper" label="Helper" />)
    expect(screen.getByRole('img')).not.toHaveClass('scale-150')
    rerender(<MapPin slug="helper" label="Helper" selected />)
    expect(screen.getByRole('img')).toHaveClass('scale-150', 'ring-2')
  })
})

describe('MapLayout', () => {
  const layout = (props: Partial<Parameters<typeof MapLayout>[0]> = {}) => (
    <MapLayout
      topBar={<header>Top bar</header>}
      map={<div>The map</div>}
      title="Places on the map"
      panel={<ul><li>Cafe Berlin</li></ul>}
      summary="12 places in this area"
      sheetOpen={false}
      onSheetOpenChange={() => {}}
      {...props}
    />
  )

  it('puts the results in a side panel next to the map', () => {
    render(layout())
    expect(screen.getByText('Top bar')).toBeInTheDocument()
    expect(screen.getByText('The map')).toBeInTheDocument()
    const panel = screen.getByRole('complementary', { name: 'Places on the map' })
    expect(within(panel).getByRole('heading', { level: 1, name: 'Places on the map' })).toBeInTheDocument()
    expect(within(panel).getByText('Cafe Berlin')).toBeInTheDocument()
  })

  it('opens the results as a sheet from the phone button and closes it again', async () => {
    const onSheetOpenChange = vi.fn()
    const { rerender } = render(layout({ onSheetOpenChange }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '12 places in this area' }))
    expect(onSheetOpenChange).toHaveBeenLastCalledWith(true)

    rerender(layout({ onSheetOpenChange, sheetOpen: true }))
    const sheet = screen.getByRole('dialog', { name: 'Places on the map' })
    expect(within(sheet).getByText('Cafe Berlin')).toBeInTheDocument()

    await userEvent.click(within(sheet).getByRole('button', { name: 'Close' }))
    expect(onSheetOpenChange).toHaveBeenLastCalledWith(false)
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
