// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [ vue() ],
  build: {
    // opcional: aumenta tamaño de chunk si tuvieses problemas
    chunkSizeWarningLimit: 2000
  }
})
