// server/run-playwright.ts
import path from 'path';
import { spawn } from 'child_process';

(async () => {
  try {
    const ROOT = path.resolve(path.join(__dirname, '..'));
    const pwPkg = require.resolve('@playwright/test/package.json', { paths: [__dirname, ROOT] });
    const pwDir = path.dirname(pwPkg);
    const pwCli = path.join(pwDir, 'cli.js');

    const args = process.argv.slice(2); // ej: ["test", "spec.ts"]

    // Ejecuta el CLI como script con el propio ejecutable (Electron en modo Node)
    const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1' };
    const nodeExe = process.execPath;

    let exitCode = -1;
    await new Promise<void>((resolve) => {
      const child = spawn(nodeExe, [pwCli, ...args], {
        cwd: process.cwd(),      // heredado del padre (ya correcto)
        env,
        windowsHide: true
      });

      // Reenvía la salida al proceso padre (server index captura esto)
      child.stdout?.on('data', d => process.stdout.write(d));
      child.stderr?.on('data', d => process.stderr.write(d));

      child.on('close', (code) => {
        exitCode = typeof code === 'number' ? code : -1;
        resolve();
      });

      child.on('error', (err) => {
        process.stderr.write(`[run-playwright] spawn error: ${err?.message || String(err)}\n`);
        exitCode = -1;
        resolve();
      });
    });

    process.exit(exitCode);
  } catch (err: any) {
    process.stderr.write(`[run-playwright] Error: ${err?.stack || err?.message || String(err)}\n`);
    process.exit(1);
  }
})();
