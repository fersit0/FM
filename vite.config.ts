import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Misma versión que package.json; se muestra en Ajustes
const version = '0.2.0'

export default defineConfig({
  base: '/gym-app/',
  define: { __VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gym',
        short_name: 'Gym',
        description: 'Rutina personal de gym',
        lang: 'es-MX',
        start_url: '/gym-app/',
        scope: '/gym-app/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0A0E1C',
        theme_color: '#0A0E1C',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg}'],
        navigateFallback: '/gym-app/index.html',
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
