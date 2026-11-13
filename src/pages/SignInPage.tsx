import { useLocation, useNavigate } from 'react-router-dom'
import { AuthHero } from '@/components/auth/AuthHero'
import { SignInForm } from '@/components/auth/SignInForm'
import { AuthLayout } from '@/components/ui'
import { afterSignIn, ROUTES } from '@/lib/routes'

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <AuthLayout aside={<AuthHero />} home={ROUTES.landing}>
      <SignInForm onSuccess={() => navigate(afterSignIn(location.state), { replace: true })} />
    </AuthLayout>
  )
}
