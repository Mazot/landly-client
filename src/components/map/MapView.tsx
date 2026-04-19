import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

interface Marker {
  id: string
  latitude: number
  longitude: number
  label?: string
}

interface MapViewProps {
  markers: Marker[]
  zoom?: number
  className?: string
  onMarkerClick?: (id: string) => void
}

export default function MapView({
  markers,
  zoom = 14,
  className = 'h-64 rounded-lg',
  onMarkerClick,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const onMarkerClickRef = useRef(onMarkerClick)
  onMarkerClickRef.current = onMarkerClick

  const initMap = useCallback(() => {
    if (!mapContainer.current) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const center: [number, number] = markers.length > 0
      ? [markers[0].longitude, markers[0].latitude]
      : [0, 20]

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: markers.length > 0 ? zoom : 1.5,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      const bounds = new mapboxgl.LngLatBounds()

      markers.forEach((m) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([m.longitude, m.latitude])

        if (m.label) {
          marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setText(m.label))
        }

        marker.addTo(map)

        marker.getElement().addEventListener('click', () => {
          onMarkerClickRef.current?.(m.id)
        })

        bounds.extend([m.longitude, m.latitude])
      })

      if (markers.length > 1) {
        map.fitBounds(bounds, { padding: 50 })
      }
    })

    mapRef.current = map
  }, [markers, zoom])

  useEffect(() => {
    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [initMap])

  // if (markers.length === 0) {
  //   return (
  //     <div className={`${className} bg-gray-100 flex items-center justify-center`}>
  //       <p className="text-gray-400">No locations to display</p>
  //     </div>
  //   )
  // }

  return <div ref={mapContainer} className={className} />
}
