import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field } from './Field'
import { TextArea } from './TextArea'
import { TextField } from './TextField'

const meta = {
  title: 'Forms/Field',
  component: Field,
  args: { label: 'Email', hint: 'We never show it publicly.', children: <TextField type="email" placeholder="you@example.com" /> },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

/** Wires label, hint and error to the control (id, aria-describedby, aria-invalid). */
export const Default: Story = {}

export const Optional: Story = { args: { label: 'Website', optional: true, hint: undefined, children: <TextField type="url" icon="link" placeholder="https://" /> } }

export const WithError: Story = { args: { label: 'Password', hint: undefined, error: 'At least 8 characters', children: <TextField type="password" defaultValue="123" /> } }

export const WithTextArea: Story = { args: { label: 'Description', hint: 'What do you help with?', children: <TextArea placeholder="Paperwork, Anmeldung, housing…" /> } }
