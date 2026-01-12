import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Minify with Terser to allow for console stripping
    minify: 'terser', 
    terserOptions: {
      compress: {
        // Removes all console.log calls in production
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Disable source maps so users can't see your raw source code
    sourcemap: false, 
    // Chunking strategy to improve loading speeds
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
})