import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapBackdrop } from './MapBackdrop'

const meta = {
  title: 'Data display/MapBackdrop',
  component: MapBackdrop,
  args: { highlight: 'DE', origin: 'RU', variant: 'plain', className: 'h-80' },
} satisfies Meta<typeof MapBackdrop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Hero: Story = { args: { variant: 'hero' } }

export const OtherCorridor: Story = { args: { highlight: 'FR', origin: 'UA' } }
