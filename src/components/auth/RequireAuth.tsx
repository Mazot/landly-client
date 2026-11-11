import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import { useAuthStore } from '@/stores/authStore'

/** Layout route for screens that need an account (adding a place): a guest is sent to sign in. */
export function RequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.signIn} replace />
}
