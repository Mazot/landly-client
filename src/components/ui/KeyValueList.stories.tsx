import type { Meta, StoryObj } from '@storybook/react-vite'
import { KeyValueList } from './KeyValueList'

const meta = {
  title: 'Containers/KeyValueList',
  component: KeyValueList,
  args: {
    items: [
      { label: 'Capital', value: 'Berlin' },
      { label: 'Currency', value: 'EUR', mono: true },
      { label: 'Dialling code', value: '+49', mono: true },
      { label: 'Places', value: '1,284' },
    ],
    card: true,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KeyValueList>

export default meta
type Story = StoryObj<typeof meta>

/** Country facts. */
export const Default: Story = {}

export const WithoutCard: Story = { args: { card: false } }
