// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { tests as dataTests } from './data/config/dataTests'; // importa tu arreglo de pruebas

const PROXY = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY;

// Si no defines WORKERS → usa el número total de pruebas (1 worker por prueba)
const defaultWorkers = process.env.WORKERS
  ? Number(process.env.WORKERS)
  : dataTests.length;

export default defineConfig({
  testDir: './tests',
  timeout: 500000,

  workers: defaultWorkers,

  fullyParallel: true, // permite paralelo en el mismo archivo

  reporter: [['html', { outputFolder: process.env.REPORT_DIR || 'playwright-report', open: 'never' }]],
  outputDir: process.env.APP_USER_DATA_DIR
    ? `${process.env.APP_USER_DATA_DIR}/test-results`
    : 'test-results',

  use: {
    headless: process.env.HEADLESS === '0' ? false : true,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'on',

    proxy: PROXY ? { server: PROXY } : undefined,

    launchOptions: {
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
        viewport: { width: 1700, height: 1600 },
        locale: 'es-ES',
        extraHTTPHeaders: { 'accept-language': 'es-ES,es;q=0.9' }
      }
    }
  ]
});
