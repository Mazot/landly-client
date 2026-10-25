/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { colorVariables } from '../tokens/tokens'

// Read from disk: Vitest blanks CSS imports, `?raw` included, so an import
// would hand the test an empty string and the check would never run.
// (`import.meta.url` is not a file: URL under jsdom; Vitest provides __dirname.)
const css = readFileSync(join(__dirname, '../tokens/tokens.css'), 'utf8')

describe('design tokens', () => {
  it('mirrors every colour of tokens.ts as a CSS variable in tokens.css', () => {
    for (const [name, hex] of Object.entries(colorVariables())) {
      expect(css, name).toMatch(new RegExp(`${name}:\\s*${hex};`, 'i'))
    }
  })

  it('flattens nested colours and collapses DEFAULT keys', () => {
    expect(colorVariables({ bg: { DEFAULT: '#1', sunken: '#2' }, note: '#3', type: { helper: { DEFAULT: '#4', soft: '#5' } } })).toEqual({
      '--bg': '#1',
      '--bg-sunken': '#2',
      '--note': '#3',
      '--type-helper': '#4',
      '--type-helper-soft': '#5',
    })
  })
})
