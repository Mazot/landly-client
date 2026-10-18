import type { Meta as StoryMeta, StoryObj } from '@storybook/react-vite'
import { Meta } from './Meta'

const meta = {
  title: 'Data display/Meta',
  component: Meta,
  args: { icon: 'eye', children: '2,481 visits' },
} satisfies StoryMeta<typeof Meta>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Strong: Story = { args: { strong: true, icon: 'pin', children: '1.2 km' } }

export const Row: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Meta icon="pin">1.2 km</Meta>
      <Meta icon="users">12 vouches</Meta>
      <Meta icon="clock">2 days ago</Meta>
    </div>
  ),
}
