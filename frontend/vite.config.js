import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // FastAPI inference service (AI chat, RAG, Quiz)
      '/rag': 'http://localhost:8001',
      '/health': 'http://localhost:8001',
      '/query': 'http://localhost:8001',
      '/quiz': 'http://localhost:8001',  // ✅ moved from Django to FastAPI
      // Django backend (auth, dashboard, topics)
      '/auth': 'http://localhost:8000',
      '/dashboard': 'http://localhost:8000',
      '/topics': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    }
  }
})

