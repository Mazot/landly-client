import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MAX_IMAGE_BYTES } from '@/types/api'
import { Dropzone } from './Dropzone'
import { Progress } from './Progress'
import { StepBar } from './StepBar'

const file = (name: string, type: string, size = 1000) => {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('Progress / StepBar', () => {
  it('clamps and labels the progress', () => {
    const { rerender } = render(<Progress value={63.6} label="cover.jpg" />)
    expect(screen.getByRole('progressbar', { name: 'cover.jpg' })).toHaveAttribute('aria-valuenow', '64')
    expect(screen.getByText('64%')).toBeInTheDocument()
    rerender(<Progress value={140} label="x" showValue={false} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    expect(screen.queryByText('100%')).not.toBeInTheDocument()
  })

  it('StepBar fills the done steps', () => {
    const { container } = render(<StepBar total={3} current={2} />)
    expect(screen.getByRole('progressbar', { name: 'Step 2 of 3' })).toBeInTheDocument()
    expect(container.querySelectorAll('.bg-accent')).toHaveLength(2)
  })
})

describe('Dropzone', () => {
  it('splits picked files into accepted and rejected', () => {
    const onFiles = vi.fn()
    const onReject = vi.fn()
    render(<Dropzone onFiles={onFiles} onReject={onReject} upload={{ name: 'cover.jpg', progress: 40 }} />)
    const ok = file('a.png', 'image/png')
    const big = file('b.jpg', 'image/jpeg', MAX_IMAGE_BYTES + 1)
    const pdf = file('c.pdf', 'application/pdf')
    fireEvent.change(screen.getByTestId('dropzone-input'), { target: { files: [ok, big, pdf] } })
    expect(onFiles).toHaveBeenCalledWith([ok])
    expect(onReject).toHaveBeenCalledWith([big, pdf])
    expect(screen.getByRole('progressbar', { name: 'cover.jpg' })).toBeInTheDocument()
  })

  it('accepts dropped files and highlights while dragging', () => {
    const onFiles = vi.fn()
    render(<Dropzone onFiles={onFiles} title="Add photos" hint="Max 10 MB" />)
    const zone = screen.getByRole('button', { name: /Add photos/ })
    fireEvent.dragOver(zone)
    expect(zone).toHaveClass('bg-accent-tint')
    fireEvent.dragLeave(zone)
    expect(zone).not.toHaveClass('border-accent')
    const ok = file('a.webp', 'image/webp')
    fireEvent.drop(zone, { dataTransfer: { files: [ok] } })
    expect(onFiles).toHaveBeenCalledWith([ok])
    expect(screen.getByText('Max 10 MB')).toBeInTheDocument()
  })

  it('ignores rejected files without onReject and calls nothing for an empty pick', () => {
    const onFiles = vi.fn()
    render(<Dropzone onFiles={onFiles} multiple={false} />)
    fireEvent.change(screen.getByTestId('dropzone-input'), { target: { files: [file('c.pdf', 'application/pdf')] } })
    fireEvent.change(screen.getByTestId('dropzone-input'), { target: { files: null } })
    expect(onFiles).not.toHaveBeenCalled()
  })

  it('opens the file picker on click, Enter and Space', async () => {
    render(<Dropzone onFiles={() => {}} />)
    const click = vi.spyOn(HTMLInputElement.prototype, 'click')
    const zone = screen.getByRole('button', { name: /Drop photos here/ })
    await userEvent.click(zone)
    zone.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.keyboard('a')
    expect(click).toHaveBeenCalledTimes(3)
  })
})
