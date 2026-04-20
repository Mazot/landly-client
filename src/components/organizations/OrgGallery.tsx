import { useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import { useOrgImages } from '@/hooks/useImages'
import { useTranslation } from 'react-i18next'

// @ts-expect-error - No types available for these CSS imports 
import 'swiper/css'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

interface Props {
  organisationId: string
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
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
      <div className="card">
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  const images = data?.items ?? []
  if (images.length === 0) return null

  const sorted = [...images].sort((a, b) =>
    a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
  )

  const slides = sorted.map((img) => ({ src: img.url }))

  const handleProgress = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">{t('organizationDetail.gallery')}</h3>

      <div className="relative">
        {/* Prev arrow */}
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={isBeginning}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
                     w-8 h-8 flex items-center justify-center
                     bg-white border border-gray-200 rounded-full shadow-md
                     text-gray-600 hover:text-primary-600 hover:border-primary-400
                     transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>

        {/* Next arrow */}
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          disabled={isEnd}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10
                     w-8 h-8 flex items-center justify-center
                     bg-white border border-gray-200 rounded-full shadow-md
                     text-gray-600 hover:text-primary-600 hover:border-primary-400
                     transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next"
        >
          <ChevronRight />
        </button>

        <Swiper
          modules={[A11y]}
          spaceBetween={12}
          slidesPerView="auto"
          onSwiper={(swiper) => {
            swiperRef.current = swiper
            setIsBeginning(swiper.isBeginning)
            setIsEnd(swiper.isEnd)
          }}
          onProgress={handleProgress}
          className="rounded-lg overflow-hidden"
        >
          {sorted.map((img, i) => (
            <SwiperSlide key={img.id} style={{ width: 'auto' }} className="relative">
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="block rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <img
                  src={img.url}
                  alt={img.fileName}
                  className="h-64 w-auto object-cover rounded-lg"
                  loading="lazy"
                />
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
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
