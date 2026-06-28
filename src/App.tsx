import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ErrorScreen from './components/ui/ErrorScreen'
import PageFallback from './components/ui/PageFallback'

// Route-level code splitting: each page is its own chunk, so the heavy
// map-bearing routes (mapbox-gl) load only when visited.
const LandingPage = lazy(() => import('./pages/LandingPage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const OrganizationDetailPage = lazy(() => import('./pages/OrganizationDetailPage'))
const CountriesPage = lazy(() => import('./pages/CountriesPage'))
const SavedPage = lazy(() => import('./pages/SavedPage'))
const SignupPage = lazy(() => import('./pages/auth/SignupPage'))
const SignupCorridorPage = lazy(() => import('./pages/auth/SignupCorridorPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

// TODO: note inplemented yet
const AccountPage = lazy(() => import('./pages/AccountPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const MessageThreadPage = lazy(() => import('./pages/MessageThreadPage'))

function App() {
  return (
    <ErrorBoundary fallback={<ErrorScreen />}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* v2 — full-screen pages (own TopBar, no shared Layout) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/org/:id" element={<OrganizationDetailPage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/saved" element={<SavedPage />} />

          {/* auth + onboarding */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/corridor" element={<SignupCorridorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />

          <Route path="/account" element={<AccountPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:id" element={<MessageThreadPage />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
