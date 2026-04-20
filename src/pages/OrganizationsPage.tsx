import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useCountriesInfinite, useOrganizationTypes } from '@/hooks/useReferences'
import OrganizationCard from '@/components/organizations/OrganizationCard'
import MapView from '@/components/map/MapView'
import SearchableSelect from '@/components/ui/SearchableSelect'
import CreateOrganizationModal from '@/components/organizations/CreateOrganizationModal'
import { useAuthStore } from '@/stores/authStore'
import type { OrganizationFilters } from '@/services/organization.service'

const ITEMS_PER_PAGE = 50

export default function OrganizationsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Step 1: Country selection
  const [originCountryId, setOriginCountryId] = useState('')
  const [destinationCountryId, setDestinationCountryId] = useState('')

  // Step 2: Additional filters (name, type)
  const [nameFilter, setNameFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const bothSelected = !!originCountryId && !!destinationCountryId

  // Build query filters only when both countries are selected
  const filters: OrganizationFilters | undefined = useMemo(() => {
    if (!bothSelected) return undefined
    return {
      founder_country_id: originCountryId,
      location_country_id: destinationCountryId,
      name: nameFilter || undefined,
      organisation_type_id: typeFilter || undefined,
      limit: ITEMS_PER_PAGE,
      offset: 0,
    }
  }, [originCountryId, destinationCountryId, nameFilter, typeFilter, bothSelected])

  const { data, isLoading, error } = useOrganizations(filters)
  const { data: orgTypes } = useOrganizationTypes()

  // Origin country select state
  const [originSearch, setOriginSearch] = useState('')
  const originQuery = useCountriesInfinite(originSearch)
  const originCountries = useMemo(
    () => originQuery.data?.pages.flat() ?? [],
    [originQuery.data]
  )
  const originOptions = useMemo(
    () => originCountries.map((c) => ({ value: c.id, label: `${c.flag ?? ''} ${c.name}`.trim() })),
    [originCountries]
  )
  const handleOriginSearch = useCallback((q: string) => setOriginSearch(q), [])
  const handleOriginLoadMore = useCallback(() => {
    if (originQuery.hasNextPage) originQuery.fetchNextPage()
  }, [originQuery])

  // Destination country select state
  const [destSearch, setDestSearch] = useState('')
  const destQuery = useCountriesInfinite(destSearch)
  const destCountries = useMemo(
    () => destQuery.data?.pages.flat() ?? [],
    [destQuery.data]
  )
  const destOptions = useMemo(
    () => destCountries.map((c) => ({ value: c.id, label: `${c.flag ?? ''} ${c.name}`.trim() })),
    [destCountries]
  )
  const handleDestSearch = useCallback((q: string) => setDestSearch(q), [])
  const handleDestLoadMore = useCallback(() => {
    if (destQuery.hasNextPage) destQuery.fetchNextPage()
  }, [destQuery])

  const mapMarkers = useMemo(() => {
    if (!data?.items) return []
    return data.items
      .filter((org) => org.latitude && org.longitude)
      .map((org) => ({
        id: org.id,
        latitude: org.latitude!,
        longitude: org.longitude!,
        label: org.name,
      }))
  }, [data?.items])

  return (
    <div className="space-y-6">
      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(id) => navigate(`/organizations/${id}`)}
      />

      {/* Country Selection */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('organizations.pageTitle')}
          </h2>
          {isAuthenticated && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary text-sm"
            >
              + {t('organizations.createOrganization')}
            </button>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-6">
          {t('organizations.pageSubtitle')}
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('organizations.originLabel')}
            </label>
            <SearchableSelect
              options={originOptions}
              value={originCountryId}
              onChange={setOriginCountryId}
              onSearch={handleOriginSearch}
              onLoadMore={handleOriginLoadMore}
              hasMore={!!originQuery.hasNextPage}
              isLoading={originQuery.isFetchingNextPage}
              placeholder={t('organizations.originPlaceholder')}
              allLabel={t('organizations.selectCountry')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('organizations.destinationLabel')}
            </label>
            <SearchableSelect
              options={destOptions}
              value={destinationCountryId}
              onChange={setDestinationCountryId}
              onSearch={handleDestSearch}
              onLoadMore={handleDestLoadMore}
              hasMore={!!destQuery.hasNextPage}
              isLoading={destQuery.isFetchingNextPage}
              placeholder={t('organizations.destinationPlaceholder')}
              allLabel={t('organizations.selectCountry')}
            />
          </div>
        </div>
      </div>

      {/* Results section - only shows when both countries selected */}
      {bothSelected && (
        <>
          {/* Filters bar */}
          <div className="card">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.searchByName')}
                </label>
                <input
                  type="text"
                  placeholder={t('organizations.searchPlaceholder')}
                  className="input-field"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.organizationType')}
                </label>
                <select
                  className="input-field"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">{t('organizations.allTypes')}</option>
                  {orgTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.title || type.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="card">
            <MapView
              markers={mapMarkers}
              zoom={5}
              className="h-[500px] rounded-lg"
              onMarkerClick={(id) => navigate(`/organizations/${id}`)}
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="card bg-red-50 text-red-600">
              <p>{t('organizations.errorLoading', { message: (error as Error).message })}</p>
            </div>
          )}

          {/* Organization cards */}
          {data && (
            <>
              <p className="text-gray-600 text-sm">
                {t('organizations.foundCount', { count: data.total })}
              </p>

              {data.items.length === 0 ? (
                <div className="card text-center py-8 text-gray-500">
                  {t('organizations.noResults')}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.items.map((org) => (
                    <OrganizationCard key={org.id} organization={org} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Prompt when countries not yet selected */}
      {!bothSelected && (
        <div className="card text-center py-16 text-gray-400">
          <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">{t('organizations.selectBothCountries')}</p>
          <p className="mt-2 text-sm">{t('organizations.selectBothCountriesHint')}</p>
        </div>
      )}
    </div>
  )
}
