import type { Meta, StoryObj } from '@storybook/react-vite'
import { CorridorBubble } from '../CorridorBubble'

const meta = {
  title: 'Data display/CorridorBubble',
  component: CorridorBubble,
  args: { from: '🇷🇺', to: '🇩🇪', label: 'Russia → Germany', title: '234 places', detail: '4 embassies · 12 new this week' },
} satisfies Meta<typeof CorridorBubble>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A guest has no "new this week" figure. */
export const WithoutNews: Story = { args: { detail: '4 embassies' } }

export const TitleOnly: Story = { args: { detail: undefined } }
