import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { afterSignIn } from '@/lib/routes'
import { useAuthStore } from '@/stores/authStore'

/** Layout route for sign-in / sign-up: a signed-in user is sent on to the app (or back to the screen that asked for the account). */
export function GuestOnly() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  return isAuthenticated ? <Navigate to={afterSignIn(location.state)} replace /> : <Outlet />
}
