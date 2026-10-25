import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { flattenChildren, initialsOf, useControllableState } from '../lib/internal'

describe('useControllableState', () => {
  it('keeps its own state when uncontrolled', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<number | undefined>(undefined, 1, onChange))
    act(() => result.current[1](2))
    expect(result.current[0]).toBe(2)
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('follows the value when controlled and works without onChange', () => {
    const { result } = renderHook(() => useControllableState(5, 1))
    act(() => result.current[1](9))
    expect(result.current[0]).toBe(5)
  })
})

describe('initialsOf', () => {
  it.each([
    ['Anna Morozova', 'AM'],
    ['igor', 'I'],
    ['  Daria  Kuznetsova  Petrovna ', 'DK'],
    ['', '?'],
    ['   ', '?'],
    ['🇩🇪 Club', 'C'],
    ['😀 Ann Lee', 'AL'],
    ['Ёжик в тумане', 'ЁВ'],
  ])('%s → %s', (name, initials) => expect(initialsOf(name)).toBe(initials))
})

describe('flattenChildren', () => {
  it('unwraps nested fragments and drops empty children', () => {
    const items = flattenChildren(
      <>
        <b>a</b>
        <>
          <i>b</i>
          {false}
          <u>c</u>
        </>
      </>,
    )
    expect(items).toHaveLength(3)
  })
})
