import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { StarInput } from './StarInput'

const meta = {
  title: 'Forms/StarInput',
  component: StarInput,
  args: { label: 'Your rating', defaultValue: 0, size: 'lg', onChange: fn() },
} satisfies Meta<typeof StarInput>

export default meta
type Story = StoryObj<typeof meta>

/** Rating for `POST /review/create` (1–5). */
export const Default: Story = {}

export const Rated: Story = { args: { defaultValue: 4 } }

export const Medium: Story = { args: { size: 'md', defaultValue: 3 } }
