import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { useAuthStore } from '@/stores/authStore'

/** Layout route for sign-in / sign-up: a signed-in user is sent on to the app. */
export function GuestOnly() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to={ROUTES.map} replace /> : <Outlet />
}
