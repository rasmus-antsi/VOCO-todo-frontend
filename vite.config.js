import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
  preview: {
    // `npm start` serves the built bundle. The host assigns the port, and its
    // domain is not known at build time, so accept whatever it gives us.
    host: true,
    port: Number(process.env.PORT) || 4173,
    allowedHosts: true,
  },
})
