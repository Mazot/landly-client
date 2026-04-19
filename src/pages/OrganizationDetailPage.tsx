import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrganization } from '@/hooks/useOrganizations'
import { useCountries, useOrganizationTypes } from '@/hooks/useReferences'
import MapView from '@/components/map/MapView'

export default function OrganizationDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: organization, isLoading, error } = useOrganization(id!)
  const { data: countries } = useCountries()
  const { data: orgTypes } = useOrganizationTypes()

  const country = countries?.find((c) => c.id === organization?.locationCountryId)
  const founderCountry = countries?.find(
    (c) => c.id === organization?.founderCountryId
  )
  const orgType = orgTypes?.find(
    (t) => t.id === organization?.organisationTypeId
  )

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="card bg-red-50 text-red-600">
        <p>{t('organizationDetail.errorLoading')}</p>
        <Link to="/organizations" className="text-primary-600 underline mt-4 block">
          {t('organizationDetail.backToOrganizations')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/organizations"
        className="text-primary-600 hover:underline inline-block mb-4"
      >
        {t('organizationDetail.backToOrganizations')}
      </Link>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {organization.name}
            </h1>
            {orgType && (
              <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                {orgType.title || orgType.type}
              </span>
            )}
          </div>
          {country?.flag && <span className="text-5xl">{country.flag}</span>}
        </div>

        {organization.description && (
          <p className="text-gray-700 text-lg mb-6">{organization.description}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('organizationDetail.locationDetails')}</h3>

            {country && (
              <div>
                <span className="text-gray-500 text-sm">{t('organizationDetail.country')}:</span>
                <p className="font-medium">{country.name}</p>
              </div>
            )}

            {organization.address && (
              <div>
                <span className="text-gray-500 text-sm">{t('organizationDetail.address')}:</span>
                <p className="font-medium">{organization.address}</p>
              </div>
            )}

            {organization.latitude && organization.longitude && (
              <div>
                <span className="text-gray-500 text-sm">{t('organizationDetail.coordinates')}:</span>
                <p className="font-medium">
                  {organization.latitude}, {organization.longitude}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t('organizationDetail.contactInformation')}</h3>

            {organization.tel && (
              <div>
                <span className="text-gray-500 text-sm">{t('organizationDetail.phone')}:</span>
                <p className="font-medium">
                  <a
                    href={`tel:${organization.tel}`}
                    className="text-primary-600 hover:underline"
                  >
                    {organization.tel}
                  </a>
                </p>
              </div>
            )}

            {organization.email && (
              <div>
                <span className="text-gray-500 text-sm">{t('organizationDetail.email')}:</span>
                <p className="font-medium">
                  <a
                    href={`mailto:${organization.email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {organization.email}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {founderCountry && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-lg mb-2">{t('organizationDetail.origin')}</h3>
            <p className="text-gray-700">
              {t('organizationDetail.foundedBy', { country: founderCountry.name })}
            </p>
          </div>
        )}
      </div>

      {organization.latitude && organization.longitude && (
        <div className="card">
        <h3 className="font-semibold text-lg mb-4">{t('organizationDetail.locationOnMap')}</h3>
          <MapView
            markers={[
              {
                id: organization.id,
                latitude: organization.latitude,
                longitude: organization.longitude,
                label: organization.name,
              },
            ]}
            className="h-80 rounded-lg"
          />
        </div>
      )}
    </div>
  )
}
