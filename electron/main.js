// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let win;

// --- Levantar tu server Express precompilado (dist-server/index.js) ---
function startServer() {
  process.env.PORT = process.env.PORT || '5170';
  const serverEntry = path.join(__dirname, '..', 'dist-server', 'index.js');
  if (!fs.existsSync(serverEntry)) {
    console.error('No existe dist-server/index.js. Ejecuta: npm run build:server');
    app.quit();
    return;
  }
  // Requiere el server ya compilado a JS
  require(serverEntry);
}

// --- (Opcional) Instalar browsers de Playwright sin npx ---
function ensurePlaywrightBrowsers() {
  try {
    const flagDir = app.getPath('userData');
    const flag = path.join(flagDir, 'browsers_installed.flag');
    if (fs.existsSync(flag)) return;

    const pwPkg = require.resolve('playwright/package.json', { paths: [path.join(__dirname, '..')] });
    const pwCli = path.join(path.dirname(pwPkg), 'cli.js');

    const child = spawn(process.execPath, [pwCli, 'install'], {
      cwd: path.join(__dirname, '..'),
      env: process.env
    });

    child.on('error', (err) => {
      console.warn('Playwright install error:', err.message);
    });

    child.on('close', (code) => {
      if (code === 0) {
        try { fs.writeFileSync(flag, String(Date.now())); } catch {}
      } else {
        console.warn('Playwright install exit code:', code);
      }
    });
  } catch (e) {
    console.warn('ensurePlaywrightBrowsers() failed:', e?.message || e);
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Playwright Test Dashboard',
    webPreferences: { devTools: true }
  });
  const port = process.env.PORT || '5170';
  win.loadURL(`http://127.0.0.1:${port}/`);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  app.whenReady().then(() => {
    ensurePlaywrightBrowsers(); // opcional
    startServer();              // usa dist-server/index.js
    createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
