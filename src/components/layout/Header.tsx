import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export default function Header() {
  const { t, i18n } = useTranslation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate()
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            🌍 Landly
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/organizations"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('header.organizations')}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {user?.username || t('header.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {t('header.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {t('header.login')}
                </Link>
                <Link to="/signup" className="btn-primary">
                  {t('header.signUp')}
                </Link>
              </>
            )}

            <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`px-2 py-1 text-sm font-medium transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
