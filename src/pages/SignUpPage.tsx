import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthHero } from '@/components/auth/AuthHero'
import { authFailure, signupConflict } from '@/components/auth/authErrors'
import { SignUpAccountForm, type AccountValues } from '@/components/auth/SignUpAccountForm'
import { SignUpProfileForm } from '@/components/auth/SignUpProfileForm'
import { AuthLayout } from '@/components/ui'
import { useSignUp } from '@/hooks/useAuth'
import { ROUTES } from '@/lib/routes'

/**
 * Two steps, one request: step 1 collects the account, step 2 the optional profile and
 * corridor, then `POST /api/user/signup` (v2) creates both. The password lives in this
 * component's state only — never in a store or the URL.
 */
export default function SignUpPage() {
  const navigate = useNavigate()
  const signUp = useSignUp()
  const [account, setAccount] = useState<AccountValues>()
  const [step, setStep] = useState<1 | 2>(1)
  const [conflict, setConflict] = useState<'username' | 'email'>()

  return (
    <AuthLayout aside={<AuthHero />} home={ROUTES.landing}>
      {step === 2 && account ? (
        <SignUpProfileForm
          account={account}
          pending={signUp.isPending}
          failure={signUp.error && !signupConflict(signUp.error) ? authFailure(signUp.error) : undefined}
          onBack={() => {
            signUp.reset()
            setStep(1)
          }}
          onSubmit={(request) =>
            signUp.mutate(request, {
              onSuccess: () => navigate(ROUTES.map, { replace: true }),
              // Username and email are only checked by the server: send the user back to the field.
              onError: (error) => {
                const taken = signupConflict(error)
                if (!taken) return
                setConflict(taken)
                setStep(1)
              },
            })
          }
        />
      ) : (
        <SignUpAccountForm
          defaultValues={account}
          conflict={conflict}
          onEdit={() => setConflict(undefined)}
          onContinue={(values) => {
            signUp.reset()
            setAccount(values)
            setStep(2)
          }}
        />
      )}
    </AuthLayout>
  )
}
