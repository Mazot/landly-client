import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: { label: 'Daria agreed to be recommended', onChange: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

/** `consent_given` on the recommend-a-person form. */
export const Default: Story = {}

export const WithDescription: Story = {
  args: { defaultChecked: true, description: 'We send the claim link only after she confirms. She can decline at any time.' },
}
