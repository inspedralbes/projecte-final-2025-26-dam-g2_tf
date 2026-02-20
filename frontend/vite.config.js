import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), tailwindcss()],
  server: {
    host: true, 
    watch: {
      usePolling: true, 
      interval: 100,    
    },
    historyApiFallback: true, 
  },
})