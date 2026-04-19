import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          {t('home.heroTitle')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          {t('home.heroSubtitle')}
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/organizations" className="btn-primary text-lg px-8 py-3">
            {t('home.exploreOrganizations')}
          </Link>
          <Link to="/signup" className="btn-secondary text-lg px-8 py-3">
            {t('home.joinCommunity')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold mb-3">{t('home.businessDiscovery')}</h3>
          <p className="text-gray-600">
            {t('home.businessDiscoveryDesc')}
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-3">{t('home.communityHelpers')}</h3>
          <p className="text-gray-600">
            {t('home.communityHelpersDesc')}
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h3 className="text-xl font-semibold mb-3">{t('home.officialRepresentatives')}</h3>
          <p className="text-gray-600">
            {t('home.officialRepresentativesDesc')}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600 text-white rounded-lg p-12">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-primary-100">{t('home.statsOrganizations')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">150+</div>
            <div className="text-primary-100">{t('home.statsCountries')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-primary-100">{t('home.statsUsers')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">100+</div>
            <div className="text-primary-100">{t('home.statsLanguages')}</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">{t('home.ctaTitle')}</h2>
        <p className="text-gray-600 mb-8">
          {t('home.ctaSubtitle')}
        </p>
        <Link to="/signup" className="btn-primary text-lg px-8 py-3">
          {t('home.createFreeAccount')}
        </Link>
      </section>
    </div>
  )
}
