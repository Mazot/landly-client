import type { Meta, StoryObj } from '@storybook/react-vite'
import { Rating } from './Rating'

const meta = {
  title: 'Data display/Rating',
  component: Rating,
  args: { value: 4.6, count: 148, size: 'md' },
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof meta>

/** `ratingAvg` + `reviewsCount`. */
export const Default: Story = {}

export const Small: Story = { args: { size: 'sm' } }

/** `ratingAvg: null`. */
export const NoReviews: Story = { args: { value: null, count: 0 } }
