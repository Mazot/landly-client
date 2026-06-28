import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Dev-only plugin: returns seed data when the backend is unreachable.
// Only active when VITE_API_URL points at localhost and the server is down.
function mockApiPlugin(): Plugin {
  const COUNTRIES = [
    { id: 'ru', name: 'Russia', code: 'RU', iso2: 'RU', capitalCity: 'Moscow', flag: '🇷🇺' },
    { id: 'de', name: 'Germany', code: 'DE', iso2: 'DE', capitalCity: 'Berlin', flag: '🇩🇪' },
    { id: 'il', name: 'Israel', code: 'IL', iso2: 'IL', capitalCity: 'Jerusalem', flag: '🇮🇱' },
    { id: 'us', name: 'United States', code: 'US', iso2: 'US', capitalCity: 'Washington D.C.', flag: '🇺🇸' },
  ]
  const ORG_TYPES = [
    { id: 'embassy', name: 'Embassy', title: 'Embassy', color: '#0057B8' },
    { id: 'business', name: 'Business', title: 'Business', color: '#E06C3A' },
    { id: 'community', name: 'Community', title: 'Community', color: '#4F7F5C' },
    { id: 'volunteer', name: 'Volunteer', title: 'Volunteer', color: '#9B59B6' },
  ]
  const ORG = {
    id: 'seed-org-1', name: 'Русско-Немецкий Центр', address: 'Unter den Linden 26, 10117 Berlin',
    description: 'Центр поддержки русскоязычных граждан в Германии. Визы, легализация, помощь с документами и переезд.',
    tel: '+49 30 12345678', email: 'info@rdzentrum.de',
    organisation_type_id: 'embassy', location_country_id: 'de', founder_country_id: 'ru',
    coord: { lat: 52.5163, lng: 13.3777 },
  }
  const ORGS = [ORG]

  const json = (res: ServerResponse, data: unknown) => {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.end(JSON.stringify(data))
  }

  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url ?? ''
        if (url === '/api/common/countries') return json(res, COUNTRIES)
        if (url === '/api/common/org_types') return json(res, ORG_TYPES)
        if (url.startsWith('/api/organisation/list')) return json(res, { items: ORGS, total: ORGS.length })
        if (url.match(/\/api\/organisation\/fetch\/.+/)) return json(res, ORG)
        if (url.match(/\/api\/images\/list\/.+/)) return json(res, { items: [] })
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8080'

  const useMock = env.VITE_MOCK_API === 'true'

  return {
    plugins: [react(), ...(useMock ? [mockApiPlugin()] : [])],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['mapbox-gl'],
    },
    build: {
      // mapbox-gl is a large, stable vendor — isolate it into its own
      // long-cached chunk so app code and other vendors split cleanly.
      chunkSizeWarningLimit: 1800,
      rollupOptions: {
        output: {
          manualChunks: {
            mapbox: ['mapbox-gl'],
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
