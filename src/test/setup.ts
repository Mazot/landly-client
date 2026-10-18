import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { server } from './server'

// Any request without a handler fails the test instead of hitting the network.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  queryClient.clear()
  useAuthStore.getState().clearAuth()
  localStorage.clear()
})

afterAll(() => server.close())
