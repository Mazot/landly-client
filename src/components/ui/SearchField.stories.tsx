import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { SearchField } from './SearchField'

const meta = {
  title: 'Forms/SearchField',
  component: SearchField,
  args: { placeholder: 'Search places, people…', 'aria-label': 'Search', onChange: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-bg-sunken p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Over the map. */
export const Floating: Story = { args: { variant: 'floating' } }
