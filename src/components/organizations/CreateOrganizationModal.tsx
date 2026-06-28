import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationApi } from '@/services/organization.service'
import { imageApi } from '@/services/image.service'
import { useCountriesInfinite, useOrganizationTypes } from '@/hooks/useReferences'
import { useCorridor } from '@/hooks/useCorridor'
import SearchableSelect from '@/components/ui/SearchableSelect'
import TextField from '@/components/ui/TextField'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import Divider from '@/components/ui/Divider'
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

const EMPTY_FORM: CreateOrganisationRequest = {
  name: '', address: '', description: '', email: '', tel: '',
  latitude: undefined, longitude: undefined,
  location_country_id: '', founder_country_id: '', organisation_type_id: '',
}

export default function CreateOrganizationModal({ isOpen, onClose, onCreated }: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { from, to } = useCorridor()

  const [step, setStep] = useState<Step>('details')
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null)
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [form, setForm] = useState<CreateOrganisationRequest>({
    ...EMPTY_FORM,
    location_country_id: to?.id ?? '',
    founder_country_id: from?.id ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateOrganisationRequest, string>>>({})

  const { data: orgTypes } = useOrganizationTypes()

  const [locationSearch, setLocationSearch] = useState('')
  const locationQuery = useCountriesInfinite(locationSearch)
  const locationOptions = (locationQuery.data?.pages.flat() ?? []).map((c) => ({
    value: c.id, label: `${c.flag ?? ''} ${c.name}`.trim(),
  }))

  const [founderSearch, setFounderSearch] = useState('')
  const founderQuery = useCountriesInfinite(founderSearch)
  const founderOptions = (founderQuery.data?.pages.flat() ?? []).map((c) => ({
    value: c.id, label: `${c.flag ?? ''} ${c.name}`.trim(),
  }))

  const createMutation = useMutation({
    mutationFn: (data: CreateOrganisationRequest) => organizationApi.createOrganization(data),
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setCreatedOrgId(org.id)
      setStep('images')
    },
  })

  useEffect(() => () => { imageFiles.forEach((f) => URL.revokeObjectURL(f.preview)) }, [imageFiles])

  useEffect(() => {
    if (!isOpen) {
      setStep('details')
      setCreatedOrgId(null)
      setImageFiles([])
      setForm({ ...EMPTY_FORM, location_country_id: to?.id ?? '', founder_country_id: from?.id ?? '' })
      setErrors({})
    }
  }, [isOpen, from, to])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = t('createOrg.errors.nameRequired')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('createOrg.errors.invalidEmail')
    if (form.latitude !== undefined && (isNaN(form.latitude) || form.latitude < -90 || form.latitude > 90)) e.latitude = t('createOrg.errors.invalidLatitude')
    if (form.longitude !== undefined && (isNaN(form.longitude) || form.longitude < -180 || form.longitude > 180)) e.longitude = t('createOrg.errors.invalidLongitude')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    createMutation.mutate({
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
    })
  }

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type)) return
      setImageFiles((prev) => [...prev, { file, preview: URL.createObjectURL(file), isPrimary: prev.length === 0, uploading: false }])
    })
  }, [])

  const removeFile = (i: number) => {
    setImageFiles((prev) => {
      URL.revokeObjectURL(prev[i].preview)
      const next = prev.filter((_, j) => j !== i)
      if (prev[i].isPrimary && next.length > 0) next[0] = { ...next[0], isPrimary: true }
      return next
    })
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
        updated[i] = { ...updated[i], uploading: false, error: t('createOrg.uploadError') }
      }
      setImageFiles([...updated])
    }
    queryClient.invalidateQueries({ queryKey: ['images', createdOrgId] })
    onCreated?.(createdOrgId)
    onClose()
  }

  const f = (k: keyof CreateOrganisationRequest, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  if (!isOpen) return null

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,18,14,0.42)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border-1)', boxShadow: 'var(--shadow-pop)', width: '100%', maxWidth: 560, maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border-1)', flexShrink: 0 }}>
          <div>
            <div style={{ font: '600 17px/1 var(--font-sans)' }}>
              {step === 'details' ? t('createOrg.titleDetails') : t('createOrg.titleImages')}
            </div>
            <div style={{ font: '500 12.5px/1.4 var(--font-sans)', color: 'var(--ink-3)', marginTop: 4 }}>
              {step === 'details' ? t('createOrg.subtitleDetails') : t('createOrg.subtitleImages')}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-3)', flexShrink: 0 }}>
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center" style={{ padding: '12px 20px 0', gap: 8, flexShrink: 0 }}>
          {(['details', 'images'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center" style={{ gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '600 12px/1 var(--font-sans)',
                background: step === s ? 'var(--ink-1)' : s === 'images' && step === 'details' ? 'var(--surface-2)' : 'var(--type-helper)',
                color: step === s ? 'var(--surface)' : s === 'images' && step === 'details' ? 'var(--ink-3)' : '#fff',
                border: '1px solid var(--border-1)',
              }}>
                {s === 'images' && step !== 'details' ? <Icon name="check" size={11} stroke={2.5} /> : i + 1}
              </div>
              <span style={{ font: `${step === s ? 600 : 500} 13px/1 var(--font-sans)`, color: step === s ? 'var(--ink-1)' : 'var(--ink-3)' }}>
                {s === 'details' ? t('createOrg.stepDetails') : t('createOrg.stepImages')}
              </span>
              {i < 1 && <div style={{ width: 24, height: 1, background: 'var(--border-1)' }} />}
            </div>
          ))}
        </div>

        {/* ─── Step 1: Details ─── */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="l-scroll" style={{ overflowY: 'auto', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TextField
              label={`${t('createOrg.name')} *`}
              value={form.name}
              onChange={(e) => f('name', e.target.value)}
              placeholder={t('createOrg.namePlaceholder')}
              style={errors.name ? { borderColor: 'var(--danger)' } : undefined}
            />
            {errors.name && <div style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--danger)', marginTop: -8 }}>{errors.name}</div>}

            <label className="block">
              <span className="l-label">{t('createOrg.description')}</span>
              <textarea
                className="l-input"
                rows={3}
                value={form.description}
                onChange={(e) => f('description', e.target.value)}
                placeholder={t('createOrg.descriptionPlaceholder')}
                style={{ resize: 'none', height: 'auto' }}
              />
            </label>

            <TextField
              label={t('createOrg.address')}
              value={form.address}
              onChange={(e) => f('address', e.target.value)}
              placeholder={t('createOrg.addressPlaceholder')}
            />

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TextField label={t('createOrg.tel')} value={form.tel} onChange={(e) => f('tel', e.target.value)} placeholder="+1 234 567" />
              <div>
                <TextField
                  label={t('createOrg.email')} type="email" value={form.email}
                  onChange={(e) => f('email', e.target.value)} placeholder="contact@org.com"
                  style={errors.email ? { borderColor: 'var(--danger)' } : undefined}
                />
                {errors.email && <div style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--danger)', marginTop: 4 }}>{errors.email}</div>}
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <TextField
                  label={t('createOrg.latitude')} type="number" step="any"
                  value={form.latitude ?? ''}
                  onChange={(e) => f('latitude', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  placeholder="48.8566"
                  style={errors.latitude ? { borderColor: 'var(--danger)' } : undefined}
                />
                {errors.latitude && <div style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--danger)', marginTop: 4 }}>{errors.latitude}</div>}
              </div>
              <div>
                <TextField
                  label={t('createOrg.longitude')} type="number" step="any"
                  value={form.longitude ?? ''}
                  onChange={(e) => f('longitude', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  placeholder="2.3522"
                  style={errors.longitude ? { borderColor: 'var(--danger)' } : undefined}
                />
                {errors.longitude && <div style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--danger)', marginTop: 4 }}>{errors.longitude}</div>}
              </div>
            </div>

            <label className="block">
              <span className="l-label">{t('createOrg.orgType')}</span>
              <select
                className="l-input"
                value={form.organisation_type_id}
                onChange={(e) => f('organisation_type_id', e.target.value)}
              >
                <option value="">{t('createOrg.selectType')}</option>
                {orgTypes?.map((ot) => (
                  <option key={ot.id} value={ot.id}>{ot.title || ot.type}</option>
                ))}
              </select>
            </label>

            <div>
              <span className="l-label">{t('createOrg.locationCountry')}</span>
              <SearchableSelect
                options={locationOptions}
                value={form.location_country_id ?? ''}
                onChange={(v) => f('location_country_id', v)}
                onSearch={setLocationSearch}
                onLoadMore={() => locationQuery.hasNextPage && locationQuery.fetchNextPage()}
                hasMore={!!locationQuery.hasNextPage}
                isLoading={locationQuery.isFetchingNextPage}
                placeholder={t('createOrg.searchCountry')}
                allLabel={t('createOrg.selectCountry')}
              />
            </div>

            <div>
              <span className="l-label">{t('createOrg.founderCountry')}</span>
              <SearchableSelect
                options={founderOptions}
                value={form.founder_country_id ?? ''}
                onChange={(v) => f('founder_country_id', v)}
                onSearch={setFounderSearch}
                onLoadMore={() => founderQuery.hasNextPage && founderQuery.fetchNextPage()}
                hasMore={!!founderQuery.hasNextPage}
                isLoading={founderQuery.isFetchingNextPage}
                placeholder={t('createOrg.searchCountry')}
                allLabel={t('createOrg.selectCountry')}
              />
            </div>

            {createMutation.isError && (
              <div style={{ background: 'rgba(207,52,52,0.08)', borderRadius: 10, padding: '10px 14px', font: '500 13px/1.4 var(--font-sans)', color: 'var(--danger)' }}>
                {t('createOrg.createError')}
              </div>
            )}

            <Divider />
            <div className="flex justify-end" style={{ gap: 10 }}>
              <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
              <Button type="submit" variant="accent" disabled={createMutation.isPending}>
                {createMutation.isPending ? t('createOrg.creating') : t('createOrg.nextStep')} <Icon name="arrowRight" size={13} stroke={2} />
              </Button>
            </div>
          </form>
        )}

        {/* ─── Step 2: Images ─── */}
        {step === 'images' && createdOrgId && (
          <div className="l-scroll" style={{ overflowY: 'auto', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
              style={{
                border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border-2)'}`,
                borderRadius: 14, padding: '32px 16px', textAlign: 'center', cursor: 'pointer',
                background: isDragging ? 'var(--accent-tint)' : 'var(--surface-2)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <Icon name="upload" size={28} style={{ color: 'var(--ink-4)', marginBottom: 10 }} />
              <div style={{ font: '600 14px/1.4 var(--font-sans)', color: 'var(--ink-2)' }}>{t('createOrg.dropZoneTitle')}</div>
              <div style={{ font: '500 12px/1.4 var(--font-sans)', color: 'var(--ink-3)', marginTop: 4 }}>{t('createOrg.dropZoneSubtitle')}</div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </div>

            {imageFiles.length > 0 && (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {imageFiles.map((img, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-1)' }}>
                    <img src={img.preview} alt={img.file.name} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                    {img.isPrimary && (
                      <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--accent)', color: '#fff', font: '600 10px/1 var(--font-sans)', padding: '3px 7px', borderRadius: 999 }}>
                        {t('createOrg.primary')}
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 999, background: 'rgba(20,18,14,0.6)', border: 0, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Icon name="close" size={11} />
                    </button>
                    {img.uploading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                      </div>
                    )}
                    {img.error && (
                      <div style={{ position: 'absolute', bottom: 0, inset: 'auto 0 0', background: 'rgba(207,52,52,0.85)', color: '#fff', font: '500 11px/1 var(--font-sans)', padding: '4px 6px', textAlign: 'center' }}>
                        {img.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Divider />
            <div className="flex justify-end" style={{ gap: 10 }}>
              <Button variant="ghost" onClick={() => { if (createdOrgId) onCreated?.(createdOrgId); onClose() }}>
                {imageFiles.length === 0 ? t('createOrg.skip') : t('common.cancel')}
              </Button>
              {imageFiles.length > 0 && (
                <Button variant="accent" onClick={handleUploadAll} disabled={imageFiles.some((f) => f.uploading)}>
                  {imageFiles.some((f) => f.uploading) ? t('createOrg.uploading') : t('createOrg.uploadAndFinish', { count: imageFiles.length })}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
