import { act, renderHook } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { setViewportWidth } from '@/test/viewport'
import { useBreakpoint } from '../useBreakpoint'

function Probe() {
  return <>{useBreakpoint()}</>
}

describe('useBreakpoint', () => {
  it('is desktop at the jsdom default width', () => {
    expect(renderHook(() => useBreakpoint()).result.current).toBe('desktop')
  })

  it.each([
    [320, 'phone'],
    [767, 'phone'],
    [768, 'tablet'],
    [1023, 'tablet'],
    [1024, 'desktop'],
    [1440, 'desktop'],
  ])('is %i px → %s', (width, expected) => {
    setViewportWidth(width)
    expect(renderHook(() => useBreakpoint()).result.current).toBe(expected)
  })

  it('is desktop when rendered on a server, where there is no window to measure', () => {
    expect(renderToString(<Probe />)).toBe('desktop')
  })

  it('follows the viewport while mounted and stops listening on unmount', () => {
    const { result, unmount } = renderHook(() => useBreakpoint())
    act(() => setViewportWidth(375))
    expect(result.current).toBe('phone')
    act(() => setViewportWidth(900))
    expect(result.current).toBe('tablet')
    unmount()
    act(() => setViewportWidth(1440))
    expect(result.current).toBe('tablet')
  })
})
