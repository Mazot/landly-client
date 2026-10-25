import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Field } from './Field'
import { Accent, PageHeader } from './PageHeader'
import { TextField } from './TextField'
import { AuthLayout } from './AuthLayout'

const meta = {
  title: 'Shell/AuthLayout',
  component: AuthLayout,
  parameters: { layout: 'fullscreen' },
  args: {
    aside: (
      <PageHeader
        as="h2"
        size="xl"
        title={
          <>
            Find <Accent>your people</Accent> in a new country.
          </>
        }
        lede="Embassies, businesses, communities and helpers from home, checked by moderators and the community."
      />
    ),
    children: (
      <div className="flex flex-col gap-4">
        <PageHeader size="md" as="h1" title="Welcome back" lede="Sign in to save places and recommend helpers." />
        <Field label="Email">
          <TextField icon="mail" type="email" defaultValue="anna.m@mail.com" />
        </Field>
        <Button variant="accent" size="lg" className="w-full">
          Sign in
        </Button>
      </div>
    ),
  },
} satisfies Meta<typeof AuthLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutAside: Story = { args: { aside: undefined } }
