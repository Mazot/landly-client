import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TextField } from './TextField'

const meta = {
  title: 'Forms/TextField',
  component: TextField,
  args: { placeholder: 'Organisation name', 'aria-label': 'Organisation name', size: 'md', variant: 'default', onChange: fn() },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3 bg-bg-sunken p-3">
      <TextField {...args} variant="default" placeholder="default" aria-label="default" />
      <TextField {...args} variant="filled" placeholder="filled" aria-label="filled" />
      <TextField {...args} variant="floating" placeholder="floating (over the map)" aria-label="floating" />
    </div>
  ),
}

export const WithIcon: Story = { args: { icon: 'pin', placeholder: 'Address', 'aria-label': 'Address' } }

/** Text addon, e.g. a dialling code. */
export const WithAddon: Story = { args: { addon: '+49', type: 'tel', placeholder: '157 1234567', 'aria-label': 'Phone' } }

/** `type="password"` adds a show/hide button. */
export const Password: Story = { args: { type: 'password', defaultValue: 'correct horse', 'aria-label': 'Password', placeholder: undefined } }

export const Invalid: Story = { args: { invalid: true, defaultValue: 'not-an-email', 'aria-label': 'Email' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'daria@example.com', 'aria-label': 'Email' } }

export const Small: Story = { args: { size: 'sm' } }
