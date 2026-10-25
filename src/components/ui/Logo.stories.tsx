import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './Logo'

const meta = {
  title: 'Primitives/Logo',
  component: Logo,
  args: { size: 'md', variant: 'full' },
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <Logo {...args} size="sm" />
      <Logo {...args} size="md" />
      <Logo {...args} size="md" variant="mark" />
    </div>
  ),
}

export const Link: Story = { args: { to: '/' } }
