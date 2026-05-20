import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      // Mappls OAuth token endpoint (bypasses CORS for dev)
      '/mappls-auth': {
        target: 'https://outpost.mappls.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mappls-auth/, ''),
        secure: true
      },
      // Mappls Atlas REST API (bypasses CORS for dev)
      '/mappls-api': {
        target: 'https://atlas.mappls.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mappls-api/, ''),
        secure: true
      }
    }
  }
})
