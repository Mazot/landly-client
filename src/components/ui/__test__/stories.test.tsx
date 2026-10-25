import * as a11yAnnotations from '@storybook/addon-a11y/preview'
import { composeStories, type composeStory, setProjectAnnotations } from '@storybook/react-vite'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import * as previewAnnotations from '../../../../.storybook/preview'
import * as ui from '../index'

// Storybook is the design system's catalogue: every component has a story, and every
// story renders cleanly — no React errors, no axe violations (`a11y.test: 'error'`).
const annotations = setProjectAnnotations([a11yAnnotations, previewAnnotations])
beforeAll(annotations.beforeAll)

type StoryModule = Parameters<typeof composeStories>[0]
type ComposedStory = ReturnType<typeof composeStory>
const modules = import.meta.glob<StoryModule>('../**/*.stories.tsx', { eager: true })

/** Exported helpers that are demonstrated inside another component's stories. */
const SHOWN_ELSEWHERE: Record<string, string> = { Accent: 'PageHeader' }

describe('design-system stories', () => {
  it('every component exported from the barrel has a story file', () => {
    const components = Object.entries(ui)
      .filter(([name, value]) => typeof value === 'function' && /^[A-Z]/.test(name))
      .map(([name]) => SHOWN_ELSEWHERE[name] ?? name)
    const withStories = Object.keys(modules).map((file) => file.replace(/^.*\//, '').replace('.stories.tsx', ''))
    expect(components.filter((name) => !withStories.includes(name))).toEqual([])
  })

  const cases = Object.entries(modules).flatMap(([file, module]) =>
    Object.entries(composeStories(module) as Record<string, ComposedStory>).map(([name, Story]) => [`${file.replace('./', '')} › ${name}`, Story] as const),
  )

  describe.each(cases)('%s', (_, Story) => {
    afterEach(cleanup)

    it('renders without React errors or accessibility violations', async () => {
      const consoleError = vi.spyOn(console, 'error')
      await Story.run()
      expect(consoleError).not.toHaveBeenCalled()

      // The a11y addon only records axe results (it throws only under its own Vitest
      // plugin), so read its report: it must exist and list no violations.
      const report = Story.reporting.reports.find((r) => r.type === 'a11y')
      expect(report, 'axe did not run for this story').toBeDefined()
      const result = report?.result as { violations?: { id: string; nodes: { target: unknown }[] }[]; error?: unknown }
      expect(result.error).toBeUndefined()
      expect((result.violations ?? []).map((v) => `${v.id}: ${JSON.stringify(v.nodes.map((n) => n.target))}`)).toEqual([])
    })
  })
})
