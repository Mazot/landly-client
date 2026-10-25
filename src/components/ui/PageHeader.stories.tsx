import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Accent, PageHeader, type PageHeaderSize } from './PageHeader'
import { TextLink } from './TextLink'

const SIZES: PageHeaderSize[] = ['sm', 'md', 'lg', 'xl', 'hero']

const meta = {
  title: 'Containers/PageHeader',
  component: PageHeader,
  args: {
    eyebrow: 'Russia → Germany',
    title: (
      <>
        Where people from <Accent>Russia</Accent> live
      </>
    ),
    lede: '1,284 places and 312 helpers, checked by the community.',
    actions: (
      <>
        <Button variant="accent" icon="plus">Add a place</Button>
        <Button variant="secondary">Change corridor</Button>
      </>
    ),
    size: 'lg',
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      {/* <header> outside <main>/<section> is the page banner — there may be only one, so each sits in a section. */}
      {SIZES.map((size) => (
        <section key={size} aria-label={`size ${size}`}>
          <PageHeader {...args} size={size} actions={undefined} lede={undefined} eyebrow={`size="${size}"`} />
        </section>
      ))}
    </div>
  ),
}

export const WithBack: Story = { args: { back: <TextLink to="/" icon="arrowLeft" tone="muted">Back</TextLink>, size: 'md' } }
