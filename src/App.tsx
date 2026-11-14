import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { GuestOnly } from '@/components/auth/GuestOnly'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RouteBoundary } from '@/components/layout/RouteBoundary'
import { ROUTES } from '@/lib/routes'
import { GOOGLE_CALLBACK_PATH } from '@/services/user.service'

// Every screen is its own chunk, loaded when its route is first opened; the Google Maps layout
// wraps only the routes that need a map.
const MapsProvider = lazy(() => import('@/components/MapsProvider'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const SignInPage = lazy(() => import('@/pages/SignInPage'))
const SignUpPage = lazy(() => import('@/pages/SignUpPage'))
const GoogleCallbackPage = lazy(() => import('@/pages/GoogleCallbackPage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const PlacePage = lazy(() => import('@/pages/PlacePage'))
const AddPlacePage = lazy(() => import('@/pages/AddPlacePage'))
const AddPlaceSentPage = lazy(() => import('@/pages/AddPlaceSentPage'))
const EditPlacePage = lazy(() => import('@/pages/EditPlacePage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const EditProfilePage = lazy(() => import('@/pages/EditProfilePage'))

/**
 * Screens are added one design section at a time (done: sign in & sign up, the map, a place's panel and page, add a place, edit a place, account).
 * Claim links point to `/claim/{token}`; `ROUTES.map` is public and is where a signed-in user lands.
 */
function App() {
  return (
    <RouteBoundary>
      <Routes>
        <Route element={<MapsProvider />}>
          <Route element={<GuestOnly />}>
            <Route path={ROUTES.landing} element={<LandingPage />} />
            <Route path={ROUTES.signIn} element={<SignInPage />} />
            <Route path={ROUTES.signUp} element={<SignUpPage />} />
          </Route>
          <Route path={GOOGLE_CALLBACK_PATH} element={<GoogleCallbackPage />} />
          <Route path={ROUTES.map} element={<MapPage />} />
          <Route path={`${ROUTES.place}/:id`} element={<PlacePage />} />
          <Route element={<RequireAuth />}>
            <Route path={ROUTES.add} element={<AddPlacePage />} />
            <Route path={`${ROUTES.place}/:id/edit`} element={<EditPlacePage />} />
          </Route>
        </Route>
        <Route element={<RequireAuth />}>
          <Route path={`${ROUTES.addSent}/:id`} element={<AddPlaceSentPage />} />
          <Route path={ROUTES.account} element={<AccountPage />} />
          <Route path={ROUTES.accountEdit} element={<EditProfilePage />} />
        </Route>
        <Route path="*" element={null} />
      </Routes>
    </RouteBoundary>
  )
}

export default App
