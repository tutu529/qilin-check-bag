import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // 允许所有IP访问
    port: 5175, // 指定端口号
  },
  plugins: [react()],
   define: {
    global: 'window',
  },
  optimizeDeps: {
    include: ['sockjs-client']
  }
})

