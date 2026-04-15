import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    // Disable Fast Refresh's strict mode to prevent lock issues
    fastRefresh: false
  })],
  server: {
    port: 5173
  }
})
