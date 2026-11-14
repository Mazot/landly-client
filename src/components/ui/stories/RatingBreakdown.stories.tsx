import type { Meta, StoryObj } from '@storybook/react-vite'
import { RatingBreakdown } from '../RatingBreakdown'

const meta = {
  title: 'Data display/RatingBreakdown',
  component: RatingBreakdown,
  args: {
    label: 'Ratings',
    rowLabel: (row) => `${row.rating} stars: ${row.count}`,
    rows: [
      { rating: 5, count: 92 },
      { rating: 4, count: 31 },
      { rating: 3, count: 14 },
      { rating: 2, count: 6 },
      { rating: 1, count: 5 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RatingBreakdown>

export default meta
type Story = StoryObj<typeof meta>

/** Bars scaled to the most common rating. */
export const Default: Story = {}

/** No reviews: empty bars. */
export const Empty: Story = { args: { rows: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 })) } }
