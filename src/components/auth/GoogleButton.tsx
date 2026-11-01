import { Button } from '@/components/ui'
import { redirectTo } from '@/lib/navigation'
import { GOOGLE_LOGIN_URL } from '@/services/user.service'

/** Starts the Google OAuth flow — a top-level navigation, the server redirects back to the callback route. */
export function GoogleButton({ children }: { children: string }) {
  return (
    <Button variant="secondary" size="lg" className="w-full" icon="google" onClick={() => redirectTo(GOOGLE_LOGIN_URL)}>
      {children}
    </Button>
  )
}
