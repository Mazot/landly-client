import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'
import { IconButton } from './IconButton'
import { ImageFrame } from './ImageFrame'
import { colors } from './tokens/tokens'

/** Inline SVG "photo" built from tokens — stories never fetch remote images. */
const SAMPLE_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${colors.country[2]}"/><circle cx="300" cy="80" r="40" fill="${colors.accent.soft}"/><path d="M0 240 140 120 260 230 330 170 400 230V300H0Z" fill="${colors.type.helper.DEFAULT}"/></svg>`,
)}`

const meta = {
  title: 'Data display/ImageFrame',
  component: ImageFrame,
  args: { src: SAMPLE_PHOTO, alt: 'Kyiv Coffee, inside', ratio: 'photo', rounded: true },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** No `OrganisationImage.url` yet. */
export const Placeholder: Story = { args: { src: null } }

export const Ratios: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-3">
      <ImageFrame {...args} ratio="square" />
      <ImageFrame {...args} ratio="photo" />
      <ImageFrame {...args} ratio="wide" />
      <ImageFrame {...args} ratio="banner" />
    </div>
  ),
}

export const WithOverlays: Story = {
  args: {
    badge: <Badge tone="dark">Primary</Badge>,
    action: <IconButton icon="close" label="Delete photo" variant="floating" size="sm" />,
  },
}
