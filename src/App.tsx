import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes } from 'react-router-dom'
import { GuestOnly } from '@/components/auth/GuestOnly'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { InlineStatus } from '@/components/ui'
import { ROUTES } from '@/lib/routes'
import { GOOGLE_CALLBACK_PATH } from '@/services/user.service'

// Every screen is its own chunk, loaded when its route is first opened.
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
  const { t } = useTranslation()
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <InlineStatus>{t('app.loading')}</InlineStatus>
        </div>
      }
    >
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
    </Suspense>
  )
}

export default App
