import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/v2/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // required for Docker container access
    port: 5173,
  },
})

