import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import PageFallback from '@/components/ui/PageFallback'

export default function GoogleCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = params.get('token')
    const id = params.get('id')
    const username = params.get('username')
    const email = params.get('email')

    if (token && id && username && email) {
      setAuth({ id, username, email, token })
      navigate('/map', { replace: true })
    } else {
      navigate('/login?error=google_failed', { replace: true })
    }
  }, [params, setAuth, navigate])

  return <PageFallback />
}
