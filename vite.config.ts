import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { inkPlugin } from './vite-plugin-ink'

export default defineConfig({
  // GitHub Pages serves the site at /vn-demo/. Dev server still uses '/'.
  base: process.env.NODE_ENV === 'production' ? '/vn-demo/' : '/',
  plugins: [react(), tailwindcss(), inkPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
