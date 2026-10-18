import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TextArea } from './TextArea'

const meta = {
  title: 'Forms/TextArea',
  component: TextArea,
  args: { placeholder: 'Tell people what you help with', 'aria-label': 'Bio', rows: 3, onChange: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Invalid: Story = { args: { invalid: true, defaultValue: 'x'.repeat(40) } }
