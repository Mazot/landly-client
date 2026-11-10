import type { Meta, StoryObj } from '@storybook/react-vite'
import { CorridorPill } from '../CorridorPill'

const meta = {
  title: 'Data display/CorridorPill',
  component: CorridorPill,
  args: { from: '🇷🇺', to: '🇩🇪', label: 'Russia → Germany', name: 'Germany', dark: false },
} satisfies Meta<typeof CorridorPill>

export default meta
type Story = StoryObj<typeof meta>

/** The current corridor in the app bar; opens the corridor picker. */
export const Default: Story = {}

/** Floating over the map on phones. */
export const Dark: Story = { args: { dark: true } }
