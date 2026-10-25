import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapBackdrop } from './MapBackdrop'

const meta = {
  title: 'Data display/MapBackdrop',
  component: MapBackdrop,
  args: { variant: 'plain', className: 'h-80' },
} satisfies Meta<typeof MapBackdrop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Hero: Story = { args: { variant: 'hero' } }
