import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Misma versión que package.json; se muestra en Ajustes
const version = '0.4.0'

export default defineConfig({
  base: '/gym-app/',
  define: { __VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png', 'pez/*.png'],
      manifest: {
        name: 'Gym',
        short_name: 'Gym',
        description: 'Rutina personal de gym',
        lang: 'es-MX',
        start_url: '/gym-app/',
        scope: '/gym-app/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#121318',
        theme_color: '#121318',
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
