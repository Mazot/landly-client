import { useNavigate } from 'react-router-dom'
import { AuthHero } from '@/components/auth/AuthHero'
import { SignInForm } from '@/components/auth/SignInForm'
import { AuthLayout } from '@/components/ui'
import { ROUTES } from '@/lib/routes'

export default function SignInPage() {
  const navigate = useNavigate()
  return (
    <AuthLayout aside={<AuthHero />} home={ROUTES.landing}>
      <SignInForm onSuccess={() => navigate(ROUTES.map, { replace: true })} />
    </AuthLayout>
  )
}
