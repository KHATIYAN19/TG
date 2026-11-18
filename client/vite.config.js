import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // scripts/prerender.mjs reads the manifest to link each page's own CSS/JS chunks in its HTML
  build: { manifest: true },
})
