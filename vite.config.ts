import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
// import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/break-points/',
  plugins: [svelte()],
  resolve: {
    alias: {
      '@': path.resolve('./src')
    }
  }
})
