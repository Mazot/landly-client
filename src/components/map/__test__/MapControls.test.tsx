import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MapControls } from '../MapControls'

describe('MapControls', () => {
  it('zooms in and out, and locates the user when it can', async () => {
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    const onLocate = vi.fn()
    render(<MapControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} onLocate={onLocate} />)
    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    await userEvent.click(screen.getByRole('button', { name: 'Show my location' }))
    expect(onZoomIn).toHaveBeenCalledOnce()
    expect(onZoomOut).toHaveBeenCalledOnce()
    expect(onLocate).toHaveBeenCalledOnce()
  })

  it('has no location button without geolocation', () => {
    render(<MapControls onZoomIn={() => {}} onZoomOut={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Show my location' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })
})
