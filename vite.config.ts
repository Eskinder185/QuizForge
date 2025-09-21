import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CHANGE THIS to the exact repo name (case-sensitive)
const repo = 'QuizForge' // 

export default defineConfig({
  plugins: [react()],
  base: `/${repo}/`,
})
