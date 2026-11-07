import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/nocturne/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Nocturne — Your words, your world',
        short_name: 'Nocturne',
        description: 'A private place for poems, fragments and other lives.',
        theme_color: '#090B0F',
        background_color: '#090B0F',
        display: 'standalone',
        start_url: '/nocturne/',
        scope: '/nocturne/',
        icons: [
          { src: '/nocturne/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/nocturne/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/nocturne/index.html',
        navigateFallbackDenylist: [/^\/_/]
      }
    })
  ]
})
