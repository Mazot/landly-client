import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🌍 Landly</h3>
            <p className="text-gray-300">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/organizations" className="hover:text-white">
                  {t('footer.organizations')}
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white">
                  {t('footer.aboutUs')}
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer.contactTitle')}</h4>
            <p className="text-gray-300">
              Email: info@landly.com
              <br />
              Support: support@landly.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>{t('footer.allRightsReserved', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
