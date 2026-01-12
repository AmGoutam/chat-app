import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Simplified config: Removed the React plugin to stop build errors
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    minify: true, 
    sourcemap: false, 
  },
})