// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/autism-interactive-book/',   // 👈 一定要加，前后都要 /
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),  // 保持你的 alias
    },
  },
})
