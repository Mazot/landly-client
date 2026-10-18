import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ChipGroup, type ChipOption } from './ChipGroup'

const TYPES: ChipOption[] = [
  { value: 'embassy', label: 'Embassies', orgType: 'embassy' },
  { value: 'business', label: 'Businesses', orgType: 'business' },
  { value: 'helper', label: 'Helpers', orgType: 'helper' },
  { value: 'community', label: 'Communities', orgType: 'community' },
  { value: 'volunteer', label: 'Volunteers', orgType: 'volunteer' },
]

const meta = {
  title: 'Forms/ChipGroup',
  component: ChipGroup,
  args: { label: 'Place types', options: TYPES, multiple: true, defaultValue: ['embassy', 'helper'], onChange: fn() },
} satisfies Meta<typeof ChipGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Multi-select filter: `onChange` gets the selected values. */
export const Multiple: Story = {}

export const Single: Story = {
  args: {
    multiple: false,
    label: 'Cost',
    defaultValue: 'free',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'paid', label: 'Paid' },
    ],
  },
}

/** One scrollable row on phones — the map filter bar. */
export const Scroll: Story = {
  args: { scroll: true },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
}

export const WithAdd: Story = { args: { onAdd: fn(), addLabel: 'Add type' } }
