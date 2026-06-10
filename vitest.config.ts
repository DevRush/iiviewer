import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Only the active app's tests — ignore the archived HistoricalAttempts projects.
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
