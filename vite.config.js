/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vitejs.dev/config/
/** Dev server port; also the local client origin the API's CORS expects. */
const port = 5173

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiUrl = env.VITE_API_URL || 'http://localhost:8080';
    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port,
            // Dev tunnels (`ngrok http 5173`) reach the dev server under their own host name.
            allowedHosts: ['.ngrok.app', '.ngrok-free.app'],
            proxy: {
                '/api': {
                    target: apiUrl,
                    changeOrigin: true,
                    // The server's CORS allows only the local client origin; a tunnel (ngrok) sends its own.
                    configure: (proxy) => {
                        proxy.on('proxyReq', (proxyReq) => {
                            if (proxyReq.getHeader('origin')) proxyReq.setHeader('origin', `http://localhost:${port}`)
                        })
                    },
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
            include: ['src/**/__test__/*.test.{ts,tsx}'],
            env: { VITE_API_URL: 'http://api.test' },
            restoreMocks: true,
            unstubEnvs: true,
            coverage: {
                provider: 'v8',
                include: ['src/**/*.{ts,tsx}'],
                exclude: ['src/**/__test__/*.test.{ts,tsx}', 'src/**/*.stories.tsx', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
                reporter: ['text', 'html', 'lcov', 'json-summary'],
                reportsDirectory: './coverage',
            },
        },
    };
});
