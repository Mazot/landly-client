import { Route, Routes } from 'react-router-dom'
import { GuestOnly } from '@/components/auth/GuestOnly'
import { GOOGLE_CALLBACK_PATH } from '@/services/user.service'
import { ROUTES } from '@/lib/routes'
import GoogleCallbackPage from '@/pages/GoogleCallbackPage'
import LandingPage from '@/pages/LandingPage'
import SignInPage from '@/pages/SignInPage'
import SignUpPage from '@/pages/SignUpPage'

/**
 * Screens are added one design section at a time (done: sign in & sign up).
 * Claim links point to `/claim/{token}`; `ROUTES.map` is where a signed-in user lands.
 */
function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path={ROUTES.landing} element={<LandingPage />} />
        <Route path={ROUTES.signIn} element={<SignInPage />} />
        <Route path={ROUTES.signUp} element={<SignUpPage />} />
      </Route>
      <Route path={GOOGLE_CALLBACK_PATH} element={<GoogleCallbackPage />} />
      <Route path="*" element={null} />
    </Routes>
  )
}

export default App
