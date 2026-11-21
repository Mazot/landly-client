import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumbs } from '../Breadcrumbs'
import { TextLink } from '../TextLink'

const meta = {
  title: 'Shell/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    label: 'Breadcrumbs',
    items: [
      <TextLink key="map" to="/map" icon="arrowLeft" tone="muted">
        Map
      </TextLink>,
      'Germany',
      'Kyiv Coffee',
    ],
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A long current page is cut, the trail stays readable. */
export const LongName: Story = {
  args: {
    items: [
      <TextLink key="map" to="/map" icon="arrowLeft" tone="muted">
        Map
      </TextLink>,
      'Germany',
      'Generalkonsulat der Ukraine in Frankfurt am Main — Konsularabteilung und Visastelle',
    ],
  },
}
