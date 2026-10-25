import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineStatus } from './InlineStatus'

const meta = {
  title: 'Primitives/InlineStatus',
  component: InlineStatus,
  args: { children: 'Signing you in…' },
} satisfies Meta<typeof InlineStatus>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
