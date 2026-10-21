import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiOgDevPlugin() {
  return {
    name: 'api-og-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api/og') || req.url.startsWith('/api/og.js'))) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:3050')
            const query = Object.fromEntries(urlObj.searchParams.entries())
            const mod = await import('./api/og.js')
            const handler = mod.default
            req.query = query
            return await handler(req, res)
          } catch (err) {
            console.error('API OG dev error:', err)
            res.statusCode = 500
            res.end('Error handling OG request: ' + err.message)
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiOgDevPlugin()
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
