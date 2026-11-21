import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui'
import { redirectTo } from '@/lib/navigation'
import { rememberReturn } from '@/lib/returnTo'
import { GOOGLE_LOGIN_URL } from '@/services/user.service'

/** Starts the Google OAuth flow — a top-level navigation, the server redirects back to the callback route. */
export function GoogleButton({ children }: { children: string }) {
  const location = useLocation()
  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full"
      icon="google"
      onClick={() => {
        // The round trip loses the router state: keep the screen that sent the user here.
        rememberReturn(location.state)
        redirectTo(GOOGLE_LOGIN_URL)
      }}
    >
      {children}
    </Button>
  )
}
