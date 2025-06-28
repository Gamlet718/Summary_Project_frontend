import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [ react() ],
  server: {
    port: 3000,
    proxy: {
      // все запросы к /api/* будут перенаправляться на Express
      '/api': {
        target: 'http://localhost:3001',  // ваш backend-порт
        changeOrigin: true,
        secure: false,
        // необязательно, но можно переписать путь:
        rewrite: path => path.replace(/^\/api/, '/api')
      }
    }
  }
})
