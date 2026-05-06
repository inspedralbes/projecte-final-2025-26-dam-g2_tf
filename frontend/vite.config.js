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

  // ─── Configuració de Vitest (tests del frontend) ─────────────
  test: {
    // globals: true → podem fer servir describe/test/expect sense importar-los
    globals: true,

    // jsdom simula el navegador per poder testar components Vue
    environment: 'jsdom',

    // On buscar els fitxers de tests
    include: ['src/__tests__/**/*.test.js'],
  }
})