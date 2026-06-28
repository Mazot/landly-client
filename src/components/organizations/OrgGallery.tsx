import { useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import { useOrgImages } from '@/hooks/useImages'
import { useTranslation } from 'react-i18next'
import Icon from '@/components/ui/Icon'

import 'swiper/css'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

interface Props {
  organisationId: string
}

export default function OrgGallery({ organisationId }: Props) {
  const { t } = useTranslation()
  const { data, isLoading } = useOrgImages(organisationId)
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)

  if (isLoading) {
    return (
      <div className="l-card" style={{ padding: 20 }}>
        <div style={{ height: 200, borderRadius: 10, background: 'var(--surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    )
  }

  const images = data?.items ?? []
  if (images.length === 0) return null

  const sorted = [...images].sort((a, b) =>
    a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
  )

  const slides = sorted.map((img) => ({ src: img.url }))

  const NavButton = ({ prev }: { prev?: boolean }) => (
    <button
      type="button"
      onClick={() => prev ? swiperRef.current?.slidePrev() : swiperRef.current?.slideNext()}
      disabled={prev ? isBeginning : isEnd}
      aria-label={prev ? 'Previous' : 'Next'}
      style={{
        position: 'absolute',
        [prev ? 'left' : 'right']: -14,
        top: '50%', transform: 'translateY(-50%)',
        zIndex: 10,
        width: 28, height: 28,
        borderRadius: 999,
        background: 'var(--surface)',
        border: '1px solid var(--border-1)',
        boxShadow: 'var(--shadow-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--ink-2)',
        opacity: (prev ? isBeginning : isEnd) ? 0.3 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <Icon name={prev ? 'arrowLeft' : 'arrowRight'} size={13} stroke={2.2} />
    </button>
  )

  return (
    <div className="l-card" style={{ padding: 20 }}>
      <div style={{ font: '600 15px/1 var(--font-sans)', marginBottom: 14 }}>
        {t('organizationDetail.gallery')}
      </div>

      <div style={{ position: 'relative' }}>
        <NavButton prev />
        <NavButton />

        <Swiper
          modules={[A11y]}
          spaceBetween={10}
          slidesPerView="auto"
          onSwiper={(swiper) => {
            swiperRef.current = swiper
            setIsBeginning(swiper.isBeginning)
            setIsEnd(swiper.isEnd)
          }}
          onProgress={(swiper) => {
            setIsBeginning(swiper.isBeginning)
            setIsEnd(swiper.isEnd)
          }}
          style={{ borderRadius: 10, overflow: 'hidden' }}
        >
          {sorted.map((img, i) => (
            <SwiperSlide key={img.id} style={{ width: 'auto' }}>
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                style={{ display: 'block', border: 0, padding: 0, cursor: 'pointer', position: 'relative' }}
              >
                <img
                  src={img.url}
                  alt={img.fileName}
                  style={{ height: 200, width: 'auto', objectFit: 'cover', borderRadius: 10, display: 'block' }}
                  loading="lazy"
                />
                {img.isPrimary && (
                  <span style={{
                    position: 'absolute', top: 8, left: 8,
                    background: 'var(--accent)', color: '#fff',
                    font: '600 10px/1 var(--font-sans)',
                    padding: '3px 8px', borderRadius: 999,
                  }}>
                    ★
                  </span>
                )}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Zoom, Thumbnails]}
      />
    </div>
  )
}
