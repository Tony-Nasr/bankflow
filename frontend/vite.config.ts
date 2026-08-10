import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },

  //new
  define: {
    __API_URL__: mode === 'production'
      ? '"https://bankflow-4u21.onrender.com/api"'
      : '"http://localhost:5004/api"'
  }
}))