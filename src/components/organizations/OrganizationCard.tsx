import type { Organization } from '@/types/api'
import { Link } from 'react-router-dom'
import { useCountries, useOrganizationTypes } from '@/hooks/useReferences'

interface OrganizationCardProps {
  organization: Organization
}

export default function OrganizationCard({
  organization,
}: OrganizationCardProps) {
  const { data: countries } = useCountries()
  const { data: orgTypes } = useOrganizationTypes()

  const country = countries?.find((c) => c.id === organization.locationCountryId)
  const founderCountry = countries?.find(
    (c) => c.id === organization.founderCountryId
  )
  const orgType = orgTypes?.find((t) => t.id === organization.organisationTypeId)

  return (
    <Link to={`/organizations/${organization.id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-800">
            {organization.name}
          </h3>
          {country?.flag && <span className="text-2xl">{country.flag}</span>}
        </div>

        {organization.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {organization.description}
          </p>
        )}

        <div className="space-y-2 text-sm text-gray-500">
          {orgType && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <span>{orgType.title || orgType.type}</span>
            </div>
          )}

          {country && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Location:</span>
              <span>{country.name}</span>
            </div>
          )}

          {founderCountry && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Origin:</span>
              <span>{founderCountry.name}</span>
            </div>
          )}

          {organization.address && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Address:</span>
              <span className="line-clamp-1">{organization.address}</span>
            </div>
          )}
        </div>

        {(organization.tel || organization.email) && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-sm">
            {organization.tel && (
              <span className="text-primary-600">📞 {organization.tel}</span>
            )}
            {organization.email && (
              <span className="text-primary-600">✉️ {organization.email}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
