import type { Meta, StoryObj } from '@storybook/react-vite'
import { Eyebrow } from '../Eyebrow'
import { Heading } from '../Heading'

const meta = {
  title: 'Primitives/Eyebrow',
  component: Eyebrow,
  args: { children: 'Showing in this area' },
} satisfies Meta<typeof Eyebrow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Above a panel title. */
export const WithHeading: Story = {
  render: (args) => (
    <div>
      <Eyebrow {...args} />
      <Heading as="h1" size="lg" className="mt-1.5">
        24 places
      </Heading>
    </div>
  ),
}
