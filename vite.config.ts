import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
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
