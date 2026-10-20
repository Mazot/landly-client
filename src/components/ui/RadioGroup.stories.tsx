import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { RadioGroup } from './RadioGroup'

const meta = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Why are you here?',
    options: [
      { value: 'newcomer', label: 'I just moved', description: 'Find embassies, helpers and your community' },
      { value: 'helping', label: 'I help newcomers', description: 'Add places and recommend people' },
      { value: 'exploring', label: 'Just exploring' },
    ],
    defaultValue: 'newcomer',
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

/** `here_as` on sign-up. */
export const Default: Story = {}

export const NothingSelected: Story = { args: { defaultValue: null } }
