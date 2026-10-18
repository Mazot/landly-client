import type { Meta, StoryObj } from '@storybook/react-vite'
import { OpenStatus } from './OpenStatus'

const meta = {
  title: 'Data display/OpenStatus',
  component: OpenStatus,
  args: { open: true, hours: 'until 18:00', size: 'md' },
  argTypes: { open: { control: 'select', options: [true, false, null] } },
} satisfies Meta<typeof OpenStatus>

export default meta
type Story = StoryObj<typeof meta>

/** Server-computed `openNow`. */
export const Open: Story = {}

export const Closed: Story = { args: { open: false, hours: 'opens 09:00' } }

export const Small: Story = { args: { size: 'sm' } }

/** `openNow: null` (no hours or timezone) renders nothing. */
export const Unknown: Story = { args: { open: null } }
