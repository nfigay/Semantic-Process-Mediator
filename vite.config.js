import { defineConfig } from 'vite'

const BASE =
  process.env.VITE_BASE_PATH ||
  '/semantic-process-mediator/'

export default defineConfig({
  base: BASE,

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 3000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          undefined
        }
      }
    }
  },

  optimizeDeps: {
    include: ['bpmn-js', 'w2ui']
  }
})