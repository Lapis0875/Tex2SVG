import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@features': new URL('./src/features', import.meta.url).pathname,
      '@lib': new URL('./src/lib', import.meta.url).pathname,
    },
  },
  optimizeDeps: {
    exclude: ['mathjax-full'],
  },
})
