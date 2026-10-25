import { describe, expect, it } from 'vitest'
import * as ui from '../index'

describe('design-system barrel', () => {
  it('exports every component and constant it lists', () => {
    const missing = Object.entries(ui)
      .filter(([, value]) => value === undefined)
      .map(([name]) => name)
    expect(missing).toEqual([])
    expect(Object.keys(ui)).toEqual(expect.arrayContaining(['Button', 'TextField', 'ChipGroup', 'ListItem', 'Sheet', 'TabBar', 'colors', 'TONES', 'UI_NS']))
  })
})
