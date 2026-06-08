import { defineConfig } from 'vite'

// Set BASE to your GitHub repository name, e.g. '/semantic-process-mediator/'
const BASE = process.env.VITE_BASE_PATH || '/semantic-process-mediator/'

export default defineConfig({
  base: BASE,
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          'bpmn-js': ['bpmn-js'],
          'w2ui': ['w2ui'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['bpmn-js', 'w2ui'],
  },
})