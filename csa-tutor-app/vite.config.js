import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensure PWA files are copied to build
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Handle PWA files in public directory
  publicDir: 'public'
})