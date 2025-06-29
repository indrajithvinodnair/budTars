import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/budTars/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Budget Tracker',
        short_name: 'Budget',
        description: 'Offline Budget Tracking PWA',
        theme_color: '#ffffff',
        start_url: '/budTars/', // Update this
        icons: [
          {
            src: '/budTars/pwa-192x192.png', // Update paths
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/budTars/pwa-512x512.png', // Update paths
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
  server: {
    host: true, // Listen on all network interfaces
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app' // Allow all ngrok domains
    ]
  }
})