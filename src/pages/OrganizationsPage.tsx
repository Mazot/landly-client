import { useState } from 'react'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useCountries, useOrganizationTypes } from '@/hooks/useReferences'
import OrganizationCard from '@/components/organizations/OrganizationCard'
import type { OrganizationFilters } from '@/services/organization.service'

const ITEMS_PER_PAGE = 12

export default function OrganizationsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<OrganizationFilters>({
    limit: ITEMS_PER_PAGE,
    offset: 0,
  })

  const { data, isLoading, error } = useOrganizations(filters)
  const { data: countries } = useCountries()
  const { data: orgTypes } = useOrganizationTypes()

  const handleFilterChange = (key: keyof OrganizationFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      offset: 0, // Reset to first page on filter change
    }))
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setFilters((prev) => ({
      ...prev,
      offset: (newPage - 1) * ITEMS_PER_PAGE,
    }))
  }

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Organizations</h1>
        <button className="btn-primary">+ Add Organization</button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name
            </label>
            <input
              type="text"
              placeholder="Search organizations..."
              className="input-field"
              onChange={(e) => handleFilterChange('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Country
            </label>
            <select
              className="input-field"
              onChange={(e) =>
                handleFilterChange('location_country_id', e.target.value)
              }
            >
              <option value="">All Countries</option>
              {countries?.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Type
            </label>
            <select
              className="input-field"
              onChange={(e) =>
                handleFilterChange('organisation_type_id', e.target.value)
              }
            >
              <option value="">All Types</option>
              {orgTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.title || type.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin Country
            </label>
            <select
              className="input-field"
              onChange={(e) =>
                handleFilterChange('founder_country_id', e.target.value)
              }
            >
              <option value="">All Origins</option>
              {countries?.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 text-red-600">
          <p>Error loading organizations: {(error as Error).message}</p>
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Found {data.total} organization{data.total !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                className="btn-secondary"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
