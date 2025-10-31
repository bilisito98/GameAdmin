import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuración para Vue
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist'
  }
})
