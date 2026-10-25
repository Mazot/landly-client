import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { authUser } from '@/test/factories'
import { renderApp } from '@/test/render'
import { GuestOnly } from '../GuestOnly'

const routes = (
  <Routes>
    <Route element={<GuestOnly />}>
      <Route path="/signin" element={<p>sign-in form</p>} />
    </Route>
    <Route path="/map" element={<p>the map</p>} />
  </Routes>
)

describe('GuestOnly', () => {
  it('lets a guest through', () => {
    renderApp(routes, { route: '/signin' })
    expect(screen.getByText('sign-in form')).toBeInTheDocument()
  })

  it('sends a signed-in user on to the map', () => {
    useAuthStore.getState().setAuth(authUser())
    renderApp(routes, { route: '/signin' })
    expect(screen.getByText('the map')).toBeInTheDocument()
  })
})
