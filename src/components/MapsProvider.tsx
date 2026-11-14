import { APIProvider } from '@vis.gl/react-google-maps'
import { Outlet } from 'react-router-dom'
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/lib/maps'

/**
 * Layout of the routes that show a Google map or search Google places: loads Google's script (and the
 * map library) only when one of them is opened. Account screens never pay for it.
 */
export default function MapsProvider() {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={GOOGLE_MAPS_LIBRARIES}>
      <Outlet />
    </APIProvider>
  )
}
