import { defineConfig } from 'vite'

const BASE =
  process.env.VITE_BASE_PATH ||
  '/Semantic-Process-Mediator/'

export default defineConfig({
  base: BASE,

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 3000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('bpmn-js')) return 'bpmn-js'
          if (id.includes('w2ui')) return 'w2ui'
        }
      }
    }
  },

  optimizeDeps: {
    include: ['bpmn-js', 'w2ui']
  }
})