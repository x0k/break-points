import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
// import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/break-points/',
  // server: { https: true },
  plugins: [
    basicSsl(),
    svelte()
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
})
