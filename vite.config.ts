import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/backend/**', '**/data/**', '**/.venv/**', '**/__pycache__/**']
    }
  },
  build: {
    // Mapbox GL JS is ~1.8MB — expected for a 3D map engine
    chunkSizeWarningLimit: 2000,
  },
}))
