import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3050,
    strictPort: true,
    open: false
  },
  preview: {
    port: 4050,
    strictPort: true,
    open: false
  },
  build: {
    chunkSizeWarningLimit: 15000
  }
})
