import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { initialsOf, useControllableState } from './internal'

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
    ['', ''],
  ])('%s → %s', (name, initials) => expect(initialsOf(name)).toBe(initials))
})
