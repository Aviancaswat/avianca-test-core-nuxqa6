// playwright.config.ts
import { defineConfig } from '@playwright/test';
const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY;

// Si tienes Chrome instalado y quieres usarlo (hereda certs del sistema):
// const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // ajusta si aplica

export default defineConfig({
  testDir: './tests',
  timeout: 500000,
  reporter: [['html', { outputFolder: process.env.REPORT_DIR || 'playwright-report', open: 'never' }]],
  outputDir: process.env.APP_USER_DATA_DIR
    ? `${process.env.APP_USER_DATA_DIR}/test-results`
    : 'test-results',
  use: {
    headless: process.env.HEADLESS === '0' ? false : true,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'on',

    // 👇 proxy en el LUGAR correcto (Playwright Test)
    proxy: PROXY ? { server: PROXY } : undefined,

    // No fuerces --disable-http2; relaja TLS y CORS privados si hace falta
    launchOptions: {
      // executablePath: CHROME_PATH, // ← descomenta para usar Chrome del sistema
      args: [
        '--ignore-certificate-errors',
        '--allow-insecure-localhost',
        '--disable-features=BlockInsecurePrivateNetworkRequests'
      ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // channel: 'chrome', // o usa executablePath de arriba para forzar Chrome del sistema
        viewport: { width: 1700, height: 1600 },
        locale: 'es-ES',
        extraHTTPHeaders: { 'accept-language': 'es-ES,es;q=0.9' }
      }
    }
  ]
});
