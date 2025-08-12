// electron/main.js
const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let win;

// ---------- Logging a archivo (backend.log en %APPDATA%) ----------
function hookConsoleToFile() {
  const dir = app.getPath('userData');
  const file = path.join(dir, 'backend.log');

  const write = (level, args) => {
    const line =
      `[${new Date().toISOString()}] [${level}] ` +
      args
        .map(a =>
          typeof a === 'string'
            ? a
            : (() => {
                try { return JSON.stringify(a); } catch { return String(a); }
              })()
        )
        .join(' ') +
      '\n';
    try { fs.appendFileSync(file, line); } catch {}
  };

  ['log', 'warn', 'error'].forEach(level => {
    const orig = console[level].bind(console);
    console[level] = (...args) => { write(level, args); orig(...args); };
  });

  process.on('uncaughtException', e => console.error('uncaughtException', e?.stack || e));
  process.on('unhandledRejection', r => console.error('unhandledRejection', r));
}

// ---------- Instalar browsers de Playwright (una vez) ----------
async function ensurePlaywrightBrowsers() {
  try {
    const flagDir = app.getPath('userData');
    const flag = path.join(flagDir, 'browsers_installed.flag');
    if (fs.existsSync(flag)) return;

    const pwPkg = require.resolve('playwright/package.json', { paths: [path.join(__dirname, '..')] });
    const pwCli = path.join(path.dirname(pwPkg), 'cli.js');

    await new Promise(resolve => {
      const child = spawn(process.execPath, [pwCli, 'install', 'chromium'], {
        cwd: path.join(__dirname, '..'),
        env: process.env,
        stdio: 'inherit',
        windowsHide: true
      });

      child.on('close', code => {
        if (code === 0) {
          try { fs.writeFileSync(flag, String(Date.now())); } catch {}
          console.log('[ensurePlaywrightBrowsers] chromium instalado');
        } else {
          console.warn('[ensurePlaywrightBrowsers] exit code:', code);
        }
        resolve();
      });

      child.on('error', err => {
        console.warn('[ensurePlaywrightBrowsers] error:', err?.message || String(err));
        resolve();
      });
    });
  } catch (e) {
    console.warn('[ensurePlaywrightBrowsers] failed:', e?.message || String(e));
  }
}

// ---------- Levantar server Express precompilado (dist-server/index.js) ----------
function startServer() {
  try {
    process.env.PORT = process.env.PORT || '5170';
    // Envs usadas por server y playwright.config.ts
    process.env.APP_ROOT = app.getAppPath();
    process.env.APP_USER_DATA_DIR = app.getPath('userData');
    process.env.REPORT_DIR = path.join(app.getPath('userData'), 'playwright-report');

    const serverEntry = path.join(__dirname, '..', 'dist-server', 'index.js');
    if (!fs.existsSync(serverEntry)) {
      const msg = 'No existe dist-server/index.js. Ejecuta: npm run build:server';
      console.error(msg);
      dialog.showErrorBox('Playwright Test Dashboard', msg);
      app.quit();
      return;
    }
    require(serverEntry);
    console.log('[server] iniciado');
  } catch (err) {
    console.error('[server] error al iniciar:', err?.stack || err?.message || String(err));
    dialog.showErrorBox('Playwright Test Dashboard', `Error al iniciar el servidor:\n${err?.message || String(err)}`);
    app.quit();
  }
}

// ---------- Crear ventana ----------
function createWindow() {
  const port = process.env.PORT || '5170';
  const url = `http://127.0.0.1:${port}/`;

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Playwright Test Dashboard',
    show: false, // mostrar cuando esté listo
    backgroundColor: '#111111',
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      // Seguridad recomendada
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
      // preload: path.join(__dirname, 'preload.js'),
    }
  });

  // Abrir enlaces externos fuera de la app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, navUrl) => {
    if (!navUrl.startsWith(url) && !navUrl.startsWith('file://')) {
      e.preventDefault();
      shell.openExternal(navUrl);
    }
  });

  win.once('ready-to-show', () => {
    win.show();
    if (!app.isPackaged && !process.env.CI) {
      win.webContents.openDevTools({ mode: 'detach' });
    } else if (process.env.DEBUG_UI === '1') {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Carga con reintentos (útil si el server tarda en levantar)
  let tries = 0;
  const maxTries = 20;
  const load = () => { win.loadURL(url).catch(() => {}); };
  load();

  win.webContents.on('did-fail-load', (_e, code, desc) => {
    console.warn('[browser] did-fail-load', code, desc);
    if (tries < maxTries) {
      const delay = Math.min(1000 * Math.pow(1.3, tries++), 5000);
      setTimeout(load, delay);
    } else {
      setTimeout(load, 1500);
    }
  });

  // Atajos útiles (Ctrl+R, F12)
  win.webContents.on('before-input-event', (_e, input) => {
    const isCtrlR = input.key.toLowerCase() === 'r' && (input.control || input.meta);
    const isF12 = input.key === 'F12';
    if (isCtrlR) win.webContents.reloadIgnoringCache();
    if (isF12) win.webContents.toggleDevTools();
  });
}

// ---------- Single instance ----------
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  app.whenReady().then(async () => {
    hookConsoleToFile();            // logs → backend.log
    await ensurePlaywrightBrowsers(); // instala chromium si falta
    startServer();                  // levanta Express (dist-server/index.js)
    createWindow();                 // abre la UI
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
