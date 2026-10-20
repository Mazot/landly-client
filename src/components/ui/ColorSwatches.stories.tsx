import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ColorSwatches } from './ColorSwatches'
import { AVATAR_COLORS } from './tokens/tokens'

const meta = {
  title: 'Forms/ColorSwatches',
  component: ColorSwatches,
  args: { label: 'Avatar colour', defaultValue: AVATAR_COLORS[0], onChange: fn() },
} satisfies Meta<typeof ColorSwatches>

export default meta
type Story = StoryObj<typeof meta>

/** `avatar_color` on sign-up and profile edit. */
export const Default: Story = {}
