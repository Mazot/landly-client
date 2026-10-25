import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormNote } from './FormNote'
import { TextLink } from './TextLink'

const meta = {
  title: 'Forms/FormNote',
  component: FormNote,
  args: {
    children: (
      <>
        New to Landly?{' '}
        <TextLink to="/signup" tone="strong" size="md">
          Create an account
        </TextLink>
      </>
    ),
  },
} satisfies Meta<typeof FormNote>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = { args: { size: 'sm', children: 'or continue as guest — browsing is open to everyone' } }
