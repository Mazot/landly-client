import { Route, Routes } from 'react-router-dom'
import { GuestOnly } from '@/components/auth/GuestOnly'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { GOOGLE_CALLBACK_PATH } from '@/services/user.service'
import { ROUTES } from '@/lib/routes'
import GoogleCallbackPage from '@/pages/GoogleCallbackPage'
import AddPlacePage from '@/pages/AddPlacePage'
import AccountPage from '@/pages/AccountPage'
import EditProfilePage from '@/pages/EditProfilePage'
import AddPlaceSentPage from '@/pages/AddPlaceSentPage'
import EditPlacePage from '@/pages/EditPlacePage'
import LandingPage from '@/pages/LandingPage'
import MapPage from '@/pages/MapPage'
import PlacePage from '@/pages/PlacePage'
import SignInPage from '@/pages/SignInPage'
import SignUpPage from '@/pages/SignUpPage'

/**
 * Screens are added one design section at a time (done: sign in & sign up, the map, a place's panel and page, add a place, edit a place, account).
 * Claim links point to `/claim/{token}`; `ROUTES.map` is public and is where a signed-in user lands.
 */
function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path={ROUTES.landing} element={<LandingPage />} />
        <Route path={ROUTES.signIn} element={<SignInPage />} />
        <Route path={ROUTES.signUp} element={<SignUpPage />} />
      </Route>
      <Route path={ROUTES.map} element={<MapPage />} />
      <Route path={`${ROUTES.place}/:id`} element={<PlacePage />} />
      <Route element={<RequireAuth />}>
        <Route path={ROUTES.add} element={<AddPlacePage />} />
        <Route path={`${ROUTES.place}/:id/edit`} element={<EditPlacePage />} />
        <Route path={`${ROUTES.addSent}/:id`} element={<AddPlaceSentPage />} />
        <Route path={ROUTES.account} element={<AccountPage />} />
        <Route path={ROUTES.accountEdit} element={<EditProfilePage />} />
      </Route>
      <Route path={GOOGLE_CALLBACK_PATH} element={<GoogleCallbackPage />} />
      <Route path="*" element={null} />
    </Routes>
  )
}

export default App
