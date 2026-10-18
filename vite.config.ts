/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
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
    // Vitest: jsdom + MSW (src/test/setup.ts). Requests go through the real
    // axios client to this fake origin and are answered by MSW handlers.
    test: {
      environment: 'jsdom',
      // Same origin as the API: jsdom's XHR enforces CORS (preflights and
      // missing CORS headers would fail every mocked request).
      environmentOptions: { jsdom: { url: 'http://api.test/' } },
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      env: { VITE_API_URL: 'http://api.test' },
      restoreMocks: true,
      unstubEnvs: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
        reporter: ['text', 'html', 'lcov', 'json-summary'],
        reportsDirectory: './coverage',
      },
    },
  }
})
