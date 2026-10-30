import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Setting base to './' makes asset paths relative so it works on GitHub Pages at:
  // https://maruf-billah.github.io/KaizenJac/ or https://maruf-billah.github.io/KaizenJac/website/
  base: './',
})
