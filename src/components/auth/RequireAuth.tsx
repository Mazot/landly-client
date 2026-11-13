import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES, type ReturnState } from '@/lib/routes'
import { useAuthStore } from '@/stores/authStore'

/** Layout route for screens that need an account (adding a place): a guest is sent to sign in, and back here afterwards. */
export function RequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  const state: ReturnState = { from: { pathname: location.pathname, search: location.search } }
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.signIn} replace state={state} />
}
