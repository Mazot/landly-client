import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'
import { TONES } from './constants/tones'

const meta = {
  title: 'Data display/Badge',
  component: Badge,
  args: { children: 'Verified', tone: 'info', icon: 'verified', size: 'md' },
  argTypes: { tone: { control: 'select', options: TONES } },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      {TONES.map((tone) => (
        <Badge key={tone} {...args} tone={tone} icon={undefined}>
          {tone}
        </Badge>
      ))}
    </div>
  ),
}

export const Large: Story = { args: { size: 'lg', tone: 'warning', icon: 'flag', children: '3 reports' } }
