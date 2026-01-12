import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // This handles the React 19 JSX transform
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Adding react() here fixes the "React is not defined" error
  plugins: [react(), tailwindcss()],
  build: {
    minify: 'terser', 
    terserOptions: {
      compress: {
        drop_console: true, // Boosts performance score
        drop_debugger: true,
      },
    },
    sourcemap: false, 
  },
})