import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './Progress'

const meta = {
  title: 'Forms/Progress',
  component: Progress,
  args: { value: 42, label: 'kyiv-coffee-inside.jpg', showValue: true },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100 } } },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Done: Story = { args: { value: 100 } }

export const WithoutValue: Story = { args: { showValue: false } }
