import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { host: true },
    preview: {
        port: 3000,
        host: true, // écoute sur toutes les IP
        allowedHosts: ['join.supdeco.sn'] // ton domaine autorisé
    }
})
