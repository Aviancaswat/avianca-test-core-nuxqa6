import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 500000,
  reporter: 'allure-playwright',
  outputDir: 'test-results',
  use: {
    headless: true,
    screenshot: 'on',
    video: 'off',
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: ['--disable-http2']
    }
  },
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        viewport: { width: 1700, height: 1600 },
        locale: 'es-ES',
        extraHTTPHeaders: {
          'accept-language': 'es-ES,es;q=0.9',
        },
        video: 'off'
      },
    },
  ],
});