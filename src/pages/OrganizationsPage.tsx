import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useCountriesInfinite, useOrganizationTypes } from '@/hooks/useReferences'
import OrganizationCard from '@/components/organizations/OrganizationCard'
import MapView from '@/components/map/MapView'
import SearchableSelect from '@/components/ui/SearchableSelect'
import CreateOrganizationModal from '@/components/organizations/CreateOrganizationModal'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import TextField from '@/components/ui/TextField'
import { useAuthStore } from '@/stores/authStore'
import type { OrganizationFilters } from '@/services/organization.service'

const ITEMS_PER_PAGE = 50

export default function OrganizationsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [originCountryId, setOriginCountryId] = useState('')
  const [destinationCountryId, setDestinationCountryId] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const bothSelected = !!originCountryId && !!destinationCountryId

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

  const [originSearch, setOriginSearch] = useState('')
  const originQuery = useCountriesInfinite(originSearch)
  const originOptions = useMemo(
    () => (originQuery.data?.pages.flat() ?? []).map((c) => ({ value: c.id, label: `${c.flag ?? ''} ${c.name}`.trim() })),
    [originQuery.data]
  )
  const handleOriginLoadMore = useCallback(() => { if (originQuery.hasNextPage) originQuery.fetchNextPage() }, [originQuery])

  const [destSearch, setDestSearch] = useState('')
  const destQuery = useCountriesInfinite(destSearch)
  const destOptions = useMemo(
    () => (destQuery.data?.pages.flat() ?? []).map((c) => ({ value: c.id, label: `${c.flag ?? ''} ${c.name}`.trim() })),
    [destQuery.data]
  )
  const handleDestLoadMore = useCallback(() => { if (destQuery.hasNextPage) destQuery.fetchNextPage() }, [destQuery])

  const mapMarkers = useMemo(() => {
    if (!data?.items) return []
    return data.items
      .filter((org) => org.latitude && org.longitude)
      .map((org) => ({ id: org.id, latitude: org.latitude!, longitude: org.longitude!, label: org.name }))
  }, [data?.items])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 20px 40px', maxWidth: 960, margin: '0 auto' }}>
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(id) => navigate(`/organizations/${id}`)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ font: '600 22px/1 var(--font-sans)', margin: 0 }}>{t('organizations.pageTitle')}</h1>
          <p style={{ font: '400 14px/1.5 var(--font-sans)', color: 'var(--ink-3)', margin: '6px 0 0' }}>{t('organizations.pageSubtitle')}</p>
        </div>
        {isAuthenticated && (
          <Button variant="accent" onClick={() => setIsCreateModalOpen(true)}>
            <Icon name="plus" size={13} /> {t('organizations.createOrganization')}
          </Button>
        )}
      </div>

      {/* Country selectors */}
      <div className="l-card" style={{ padding: 20 }}>
        <div className="l-label" style={{ marginBottom: 14 }}>{t('organizations.selectCorridor', 'Select corridor')}</div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <span className="l-label">{t('organizations.originLabel')}</span>
            <SearchableSelect
              options={originOptions}
              value={originCountryId}
              onChange={setOriginCountryId}
              onSearch={useCallback((q: string) => setOriginSearch(q), [])}
              onLoadMore={handleOriginLoadMore}
              hasMore={!!originQuery.hasNextPage}
              isLoading={originQuery.isFetchingNextPage}
              placeholder={t('organizations.originPlaceholder')}
              allLabel={t('organizations.selectCountry')}
            />
          </div>
          <div>
            <span className="l-label">{t('organizations.destinationLabel')}</span>
            <SearchableSelect
              options={destOptions}
              value={destinationCountryId}
              onChange={setDestinationCountryId}
              onSearch={useCallback((q: string) => setDestSearch(q), [])}
              onLoadMore={handleDestLoadMore}
              hasMore={!!destQuery.hasNextPage}
              isLoading={destQuery.isFetchingNextPage}
              placeholder={t('organizations.destinationPlaceholder')}
              allLabel={t('organizations.selectCountry')}
            />
          </div>
        </div>
      </div>

      {/* No selection state */}
      {!bothSelected && (
        <div className="l-card flex flex-col items-center" style={{ padding: '48px 24px', gap: 12, textAlign: 'center' }}>
          <Icon name="globe" size={40} style={{ color: 'var(--ink-4)' }} />
          <div style={{ font: '600 15px/1.3 var(--font-sans)' }}>{t('organizations.selectBothCountries')}</div>
          <div style={{ font: '400 13px/1.5 var(--font-sans)', color: 'var(--ink-3)' }}>{t('organizations.selectBothCountriesHint')}</div>
        </div>
      )}

      {/* Results */}
      {bothSelected && (
        <>
          {/* Filters */}
          <div className="l-card" style={{ padding: 16 }}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <TextField
                label={t('organizations.searchByName')}
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder={t('organizations.searchPlaceholder')}
              />
              <label className="block">
                <span className="l-label">{t('organizations.organizationType')}</span>
                <select className="l-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">{t('organizations.allTypes')}</option>
                  {orgTypes?.map((type) => (
                    <option key={type.id} value={type.id}>{type.title || type.type}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Map */}
          <div className="l-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
            <MapView
              markers={mapMarkers}
              zoom={5}
              className="h-[400px]"
              onMarkerClick={(id) => navigate(`/organizations/${id}`)}
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center" style={{ padding: '32px 0' }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="l-card" style={{ padding: 16, background: 'rgba(207,52,52,0.06)', borderColor: 'var(--danger)' }}>
              <div style={{ font: '500 13px/1.4 var(--font-sans)', color: 'var(--danger)' }}>
                {t('organizations.errorLoading', { message: (error as Error).message })}
              </div>
            </div>
          )}

          {/* Count + grid */}
          {data && (
            <>
              <div style={{ font: '500 13px/1 var(--font-sans)', color: 'var(--ink-3)' }}>
                {t('organizations.foundCount', { count: data.total })}
              </div>
              {data.items.length === 0 ? (
                <div className="l-card flex flex-col items-center" style={{ padding: '40px 24px', gap: 10, textAlign: 'center' }}>
                  <Icon name="search" size={32} style={{ color: 'var(--ink-4)' }} />
                  <div style={{ font: '500 14px/1.4 var(--font-sans)', color: 'var(--ink-3)' }}>{t('organizations.noResults')}</div>
                </div>
              ) : (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {data.items.map((org) => (
                    <OrganizationCard key={org.id} organization={org} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
