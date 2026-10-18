/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin, e.g. `http://localhost:8080` (no `/api`, no trailing slash). */
  readonly VITE_API_URL?: string
  /** Google Maps Platform browser key (Maps JavaScript API + Places). */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  /** Google Maps Map ID; defaults to `DEMO_MAP_ID` (development only). */
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
