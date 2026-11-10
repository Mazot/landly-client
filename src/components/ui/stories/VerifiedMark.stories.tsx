import type { Meta, StoryObj } from '@storybook/react-vite'
import { VerifiedMark } from '../VerifiedMark'

const meta = {
  title: 'Data display/VerifiedMark',
  component: VerifiedMark,
  args: { size: 13 },
} satisfies Meta<typeof VerifiedMark>

export default meta
type Story = StoryObj<typeof meta>

/** Set only by moderators; shown after a place's name. */
export const Default: Story = {}

export const Large: Story = { args: { size: 20 } }
