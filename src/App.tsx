import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MapPage from './pages/MapPage'
import OrganizationDetailPage from './pages/OrganizationDetailPage'
import CountriesPage from './pages/CountriesPage'
import SavedPage from './pages/SavedPage'
import SignupPage from './pages/auth/SignupPage'
import SignupCorridorPage from './pages/auth/SignupCorridorPage'
import LoginPage from './pages/auth/LoginPage'
import WelcomePage from './pages/WelcomePage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
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

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
