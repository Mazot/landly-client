import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationApi } from '@/services/organization.service'
import { imageApi } from '@/services/image.service'
import { useCountriesInfinite, useOrganizationTypes } from '@/hooks/useReferences'
import SearchableSelect from '@/components/ui/SearchableSelect'
import type { CreateOrganisationRequest } from '@/types/api'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated?: (id: string) => void
}

type Step = 'details' | 'images'

interface ImageFile {
  file: File
  preview: string
  isPrimary: boolean
  uploading: boolean
  error?: string
}

export default function CreateOrganizationModal({ isOpen, onClose, onCreated }: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('details')
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const [form, setForm] = useState<CreateOrganisationRequest>({
    name: '',
    address: '',
    description: '',
    email: '',
    tel: '',
    latitude: undefined,
    longitude: undefined,
    location_country_id: '',
    founder_country_id: '',
    organisation_type_id: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateOrganisationRequest, string>>>({})

  const { data: orgTypes } = useOrganizationTypes()

  const [locationSearch, setLocationSearch] = useState('')
  const locationQuery = useCountriesInfinite(locationSearch)
  const locationCountries = locationQuery.data?.pages.flat() ?? []
  const locationOptions = locationCountries.map((c) => ({
    value: c.id,
    label: `${c.flag ?? ''} ${c.name}`.trim(),
  }))

  const [founderSearch, setFounderSearch] = useState('')
  const founderQuery = useCountriesInfinite(founderSearch)
  const founderCountries = founderQuery.data?.pages.flat() ?? []
  const founderOptions = founderCountries.map((c) => ({
    value: c.id,
    label: `${c.flag ?? ''} ${c.name}`.trim(),
  }))

  const createMutation = useMutation({
    mutationFn: (data: CreateOrganisationRequest) => organizationApi.createOrganization(data),
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setCreatedOrgId(org.id)
      setStep('images')
    },
  })

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      imageFiles.forEach((f) => URL.revokeObjectURL(f.preview))
    }
  }, [imageFiles])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('details')
      setCreatedOrgId(null)
      setImageFiles([])
      setForm({
        name: '',
        address: '',
        description: '',
        email: '',
        tel: '',
        latitude: undefined,
        longitude: undefined,
        location_country_id: '',
        founder_country_id: '',
        organisation_type_id: '',
      })
      setErrors({})
    }
  }, [isOpen])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!form.name.trim()) newErrors.name = t('createOrg.errors.nameRequired')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('createOrg.errors.invalidEmail')
    }
    if (
      form.latitude !== undefined &&
      (isNaN(form.latitude) || form.latitude < -90 || form.latitude > 90)
    ) {
      newErrors.latitude = t('createOrg.errors.invalidLatitude')
    }
    if (
      form.longitude !== undefined &&
      (isNaN(form.longitude) || form.longitude < -180 || form.longitude > 180)
    ) {
      newErrors.longitude = t('createOrg.errors.invalidLongitude')
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const payload: CreateOrganisationRequest = {
      name: form.name.trim(),
      address: form.address || undefined,
      description: form.description || undefined,
      email: form.email || undefined,
      tel: form.tel || undefined,
      latitude: form.latitude,
      longitude: form.longitude,
      location_country_id: form.location_country_id || undefined,
      founder_country_id: form.founder_country_id || undefined,
      organisation_type_id: form.organisation_type_id || undefined,
    }
    createMutation.mutate(payload)
  }

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type)) return
      setImageFiles((prev) => [
        ...prev,
        {
          file,
          preview: URL.createObjectURL(file),
          isPrimary: prev.length === 0,
          uploading: false,
        },
      ])
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const removeFile = (index: number) => {
    setImageFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      const next = prev.filter((_, i) => i !== index)
      // Ensure one primary if we just removed the primary
      if (prev[index].isPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true }
      }
      return next
    })
  }

  const togglePrimary = (index: number) => {
    setImageFiles((prev) =>
      prev.map((f, i) => ({ ...f, isPrimary: i === index }))
    )
  }

  const handleUploadAll = async () => {
    if (!createdOrgId) return
    const updated = [...imageFiles]
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], uploading: true, error: undefined }
      setImageFiles([...updated])
      try {
        await imageApi.uploadImage(createdOrgId, updated[i].file, updated[i].isPrimary)
        updated[i] = { ...updated[i], uploading: false }
      } catch {
        updated[i] = {
          ...updated[i],
          uploading: false,
          error: t('createOrg.uploadError'),
        }
      }
      setImageFiles([...updated])
    }
    queryClient.invalidateQueries({ queryKey: ['images', createdOrgId] })
    onCreated?.(createdOrgId)
    onClose()
  }

  const handleSkip = () => {
    if (createdOrgId) onCreated?.(createdOrgId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {step === 'details' ? t('createOrg.titleDetails') : t('createOrg.titleImages')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 'details' ? t('createOrg.subtitleDetails') : t('createOrg.subtitleImages')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 px-6 pt-4">
          {(['details', 'images'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-primary-600 text-white'
                    : s === 'images' && step === 'details'
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-green-500 text-white'
                }`}
              >
                {s === 'images' && step !== 'details' && createdOrgId ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${step === s ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                {s === 'details' ? t('createOrg.stepDetails') : t('createOrg.stepImages')}
              </span>
              {i < 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* ─── Step 1: Details ─── */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createOrg.name')} <span className="text-red-500">*</span>
              </label>
              <input
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('createOrg.namePlaceholder')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createOrg.description')}
              </label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('createOrg.descriptionPlaceholder')}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createOrg.address')}
              </label>
              <input
                className="input-field"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder={t('createOrg.addressPlaceholder')}
              />
            </div>

            {/* Tel + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createOrg.tel')}
                </label>
                <input
                  className="input-field"
                  value={form.tel}
                  onChange={(e) => setForm({ ...form, tel: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createOrg.email')}
                </label>
                <input
                  className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@org.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Lat + Lng */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createOrg.latitude')}
                </label>
                <input
                  className={`input-field ${errors.latitude ? 'border-red-400' : ''}`}
                  type="number"
                  step="any"
                  value={form.latitude ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      latitude: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                  placeholder="48.8566"
                />
                {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createOrg.longitude')}
                </label>
                <input
                  className={`input-field ${errors.longitude ? 'border-red-400' : ''}`}
                  type="number"
                  step="any"
                  value={form.longitude ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      longitude: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                  placeholder="2.3522"
                />
                {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
              </div>
            </div>

            {/* Organisation type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createOrg.orgType')}
              </label>
              <select
                className="input-field"
                value={form.organisation_type_id}
                onChange={(e) => setForm({ ...form, organisation_type_id: e.target.value })}
              >
                <option value="">{t('createOrg.selectType')}</option>
                {orgTypes?.map((ot) => (
                  <option key={ot.id} value={ot.id}>
                    {ot.title || ot.type}
                  </option>
                ))}
              </select>
            </div>

            {/* Location country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createOrg.locationCountry')}
              </label>
              <SearchableSelect
                options={locationOptions}
                value={form.location_country_id ?? ''}
                onChange={(v) => setForm({ ...form, location_country_id: v })}
                onSearch={setLocationSearch}
                onLoadMore={() => locationQuery.hasNextPage && locationQuery.fetchNextPage()}
                hasMore={!!locationQuery.hasNextPage}
                isLoading={locationQuery.isFetchingNextPage}
                placeholder={t('createOrg.searchCountry')}
                allLabel={t('createOrg.selectCountry')}
              />
            </div>

            {/* Founder country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createOrg.founderCountry')}
              </label>
              <SearchableSelect
                options={founderOptions}
                value={form.founder_country_id ?? ''}
                onChange={(v) => setForm({ ...form, founder_country_id: v })}
                onSearch={setFounderSearch}
                onLoadMore={() => founderQuery.hasNextPage && founderQuery.fetchNextPage()}
                hasMore={!!founderQuery.hasNextPage}
                isLoading={founderQuery.isFetchingNextPage}
                placeholder={t('createOrg.searchCountry')}
                allLabel={t('createOrg.selectCountry')}
              />
            </div>

            {createMutation.isError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
                {t('createOrg.createError')}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary"
              >
                {createMutation.isPending ? t('createOrg.creating') : t('createOrg.nextStep')}
              </button>
            </div>
          </form>
        )}

        {/* ─── Step 2: Images ─── */}
        {step === 'images' && createdOrgId && (
          <div className="p-6 space-y-4">
            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                className="w-10 h-10 mx-auto text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm text-gray-600 font-medium">{t('createOrg.dropZoneTitle')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('createOrg.dropZoneSubtitle')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {/* Preview grid */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imageFiles.map((f, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={f.preview}
                      alt={f.file.name}
                      className="w-full h-28 object-cover"
                    />
                    {/* Primary badge */}
                    <button
                      onClick={() => togglePrimary(i)}
                      className={`absolute top-1 left-1 text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        f.isPrimary
                          ? 'bg-primary-600 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-primary-100'
                      }`}
                    >
                      {f.isPrimary ? t('createOrg.primary') : t('createOrg.setPrimary')}
                    </button>
                    {/* Remove */}
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    {/* Uploading overlay */}
                    {f.uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {f.error && (
                      <div className="absolute bottom-0 inset-x-0 bg-red-500/80 text-white text-xs p-1 text-center">
                        {f.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleSkip} className="btn-secondary">
                {imageFiles.length === 0 ? t('createOrg.skip') : t('common.cancel')}
              </button>
              {imageFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={imageFiles.some((f) => f.uploading)}
                  className="btn-primary"
                >
                  {imageFiles.some((f) => f.uploading)
                    ? t('createOrg.uploading')
                    : t('createOrg.uploadAndFinish', { count: imageFiles.length })}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
