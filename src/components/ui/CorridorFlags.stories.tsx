import type { Meta, StoryObj } from '@storybook/react-vite'
import { CorridorFlags } from './CorridorFlags'

const meta = {
  title: 'Data display/CorridorFlags',
  component: CorridorFlags,
  args: { from: '🇷🇺', to: '🇩🇪', label: 'Russia to Germany', size: 'sm' },
} satisfies Meta<typeof CorridorFlags>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <CorridorFlags {...args} size="sm" />
      <CorridorFlags {...args} size="md" />
      <CorridorFlags {...args} size="lg" />
    </div>
  ),
}

export const WithText: Story = { args: { size: 'md', children: 'Russia → Germany' } }
