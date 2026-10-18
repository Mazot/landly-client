import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stars } from './Stars'

const meta = {
  title: 'Data display/Stars',
  component: Stars,
  args: { value: 4.4, size: 13 },
  argTypes: { value: { control: { type: 'range', min: 0, max: 5, step: 0.1 } } },
} satisfies Meta<typeof Stars>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Large: Story = { args: { value: 3, size: 20 } }
