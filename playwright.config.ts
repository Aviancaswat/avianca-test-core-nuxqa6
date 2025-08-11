import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 500000,

  // ⬇️ Reporter HTML con carpeta fija y sin abrir
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

  // ⬇️ artefactos (screenshots, traces) quedan aquí
  outputDir: 'test-results',

  use: {
    // Puedes controlar headless por variable de entorno:
    // HEADLESS=0 => headed; por defecto headless true
    headless: process.env.HEADLESS === '0' ? false : true,

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
        channel: 'chrome', // requiere Chrome instalado
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        viewport: { width: 1700, height: 1600 },
        locale: 'es-ES',
        extraHTTPHeaders: {
          'accept-language': 'es-ES,es;q=0.9'
        },
        video: 'off'
      }
    }
  ]
});
