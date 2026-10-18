import { Route, Routes } from 'react-router-dom'

/**
 * Screens were removed together with the old design. Add a `<Route>` per screen
 * as it is rebuilt; the data layer (`hooks/`, `services/`, `types/api`) is ready.
 * The server redirects Google sign-in to `GOOGLE_CALLBACK_PATH`
 * (`services/user.service.ts`), and claim links point to `/claim/{token}`.
 */
function App() {
  return (
    <Routes>
      <Route path="*" element={null} />
    </Routes>
  )
}

export default App
