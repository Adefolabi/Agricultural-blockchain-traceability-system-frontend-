import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      // Proxy /api requests to the backend in development.
      // This avoids CORS issues — the browser talks to Vite (same origin)
      // and Vite forwards the request server-to-server.
      // Set BACKEND_URL in .env to override the default target port.
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  }
})
