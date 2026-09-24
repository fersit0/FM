import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://localhost:5173/gym-app/', ...devices['iPhone 14'], browserName: 'chromium', viewport: { width: 390, height: 844 }, colorScheme: 'dark', screenshot: 'only-on-failure' },
  outputDir: '/private/tmp/claude-501/-Users-ferzavala-Desktop/6f0b8be9-c4be-4360-9fab-543ad0c664f6/scratchpad/e2e-out',
})
