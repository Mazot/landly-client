import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Select } from './Select'

const COUNTRIES = [
  { value: 'de', label: '🇩🇪 Germany' },
  { value: 'ru', label: '🇷🇺 Russia' },
  { value: 'ua', label: '🇺🇦 Ukraine' },
  { value: 'pl', label: '🇵🇱 Poland' },
]

const meta = {
  title: 'Forms/Select',
  component: Select,
  args: { options: COUNTRIES, placeholder: 'Choose a country', 'aria-label': 'Country', size: 'md', onChange: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

/** Native select — the system picker on phones. */
export const Default: Story = {}

export const WithIcon: Story = { args: { icon: 'globe', defaultValue: 'de' } }

export const Invalid: Story = { args: { invalid: true } }

export const Small: Story = { args: { size: 'sm', defaultValue: 'ua' } }
