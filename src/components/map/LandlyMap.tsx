/* Reusable Mapbox GL map for v2 — colour-coded org pins, active label, custom controls. */
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { TYPE_HEX, type OrgTypeKey } from '@/lib/orgTypes'
import MapControls from './MapControls'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

export interface MapMarker {
  id: string
  coord: [number, number]
  type: OrgTypeKey
  name: string
}

interface LandlyMapProps {
  markers?: MapMarker[]
  center?: [number, number]
  zoom?: number
  activeId?: string | null
  onMarkerClick?: (id: string) => void
  className?: string
  showControls?: boolean
  interactive?: boolean
  /** Auto-fit the viewport to the markers (used when there's no fixed center). */
  fitToMarkers?: boolean
  children?: ReactNode
}

function buildPinEl(marker: MapMarker, active: boolean): HTMLElement {
  const el = document.createElement('button')
  el.type = 'button'
  el.setAttribute('aria-label', marker.name)
  el.style.cssText = 'position:relative;cursor:pointer;background:transparent;border:0;padding:0;line-height:0;'

  const size = active ? 20 : 14
  const dot = document.createElement('span')
  dot.style.cssText = `display:block;width:${size}px;height:${size}px;border-radius:999px;background:${TYPE_HEX[marker.type]};border:2px solid #fff;box-shadow:0 1px 4px rgba(20,18,14,.35)${active ? ',0 0 0 5px rgba(217,119,87,.25)' : ''};`
  el.appendChild(dot)

  if (active) {
    const label = document.createElement('span')
    label.textContent = marker.name
    label.style.cssText =
      'position:absolute;left:calc(100% + 8px);top:50%;transform:translateY(-50%);white-space:nowrap;background:#1B1A17;color:#fff;font:600 12px/1 var(--font-sans);padding:6px 10px;border-radius:999px;box-shadow:0 4px 12px rgba(20,18,14,.18);'
    el.appendChild(label)
  }
  return el
}

export default function LandlyMap({
  markers = [],
  center = [10.4515, 51.1657],
  zoom = 5,
  activeId = null,
  onMarkerClick,
  className = 'h-full w-full',
  showControls = true,
  interactive = true,
  fitToMarkers = false,
  children,
}: LandlyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const onClickRef = useRef(onMarkerClick)
  onClickRef.current = onMarkerClick
  const [loaded, setLoaded] = useState(false)

  const hasToken = Boolean(mapboxgl.accessToken)
  const [lng, lat] = center

  // init once
  useEffect(() => {
    if (!hasToken || !containerRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom,
      interactive,
      attributionControl: false,
    })
    map.on('load', () => setLoaded(true))
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      setLoaded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken])

  // recenter when corridor / org changes
  useEffect(() => {
    if (mapRef.current && loaded) {
      mapRef.current.flyTo({ center: [lng, lat], zoom, duration: 700 })
    }
  }, [lng, lat, zoom, loaded])

  // (re)build markers
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = markers.map((mk) => {
      const el = buildPinEl(mk, mk.id === activeId)
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onClickRef.current?.(mk.id)
      })
      return new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(mk.coord)
        .addTo(map)
    })

    if (fitToMarkers && markers.length > 0) {
      if (markers.length === 1) {
        map.flyTo({ center: markers[0].coord, zoom: Math.max(zoom, 9), duration: 600 })
      } else {
        const bounds = new mapboxgl.LngLatBounds()
        markers.forEach((mk) => bounds.extend(mk.coord))
        map.fitBounds(bounds, { padding: 80, maxZoom: 11, duration: 600 })
      }
    }

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [markers, activeId, loaded, fitToMarkers, zoom])

  const handleZoom = (delta: number) => mapRef.current?.zoomTo((mapRef.current.getZoom() ?? zoom) + delta)
  const handleLocate = () => mapRef.current?.flyTo({ center: [lng, lat], zoom: Math.max(zoom, 9) })

  if (!hasToken) {
    return (
      <div className={`relative ${className}`} style={{ background: 'var(--country-water)' }}>
        <div className="absolute inset-0 flex items-center justify-center text-center" style={{ padding: 24 }}>
          <p style={{ font: '500 13px/1.5 var(--font-sans)', color: 'var(--ink-3)', maxWidth: 280 }}>
            Map unavailable — set <code>VITE_MAPBOX_TOKEN</code> to enable the live map.
          </p>
        </div>
        {showControls && <MapControls />}
        {children}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {showControls && (
        <MapControls
          onZoomIn={() => handleZoom(1)}
          onZoomOut={() => handleZoom(-1)}
          onLocate={handleLocate}
        />
      )}
      {children}
    </div>
  )
}
