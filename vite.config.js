import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      clientPort: 5173,
      port: 5173,
    },
    proxy: {
      '/api/onthesnow': {
        target: 'https://www.onthesnow.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/onthesnow/, ''),
      },
    },
  },
})
