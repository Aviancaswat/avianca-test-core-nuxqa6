// server/index.ts
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import archiver from 'archiver';

const app = express();
app.use(cors());
app.use(express.json());

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'playwright-report');

// Ejecutar pruebas exactamente sobre el spec indicado (default: tests/avianca.spec.ts)
app.post('/run-tests', async (req: Request, res: Response) => {
  const specFromBody: string = (req.body?.spec as string) || 'tests/avianca.spec.ts';
  const headlessFlag: boolean | undefined = req.body?.headless;

  try {
    const specAbs = path.join(ROOT, specFromBody);
    if (!fs.existsSync(specAbs)) {
      return res.status(200).json({
        ok: false,
        exitCode: -1,
        message: `Spec no encontrado: ${specFromBody}`,
        logs: '',
        errors: ''
      });
    }

    // limpiar reporte previo
    if (fs.existsSync(REPORT_DIR)) {
      fs.rmSync(REPORT_DIR, { recursive: true, force: true });
    }

    // Resolver CLI de @playwright/test y ejecutarlo con el Node actual (sin npx)
    const pwPkg = require.resolve('@playwright/test/package.json', { paths: [ROOT] });
    const pwDir = path.dirname(pwPkg);
    const pwCli = path.join(pwDir, 'cli.js');

    // HEADLESS=0 => headed; por defecto headless
    const env = { ...process.env, HEADLESS: '1' };
    if (typeof headlessFlag === 'boolean') {
      env.HEADLESS = headlessFlag ? '1' : '0';
    }

    const nodeExe = process.execPath;
    const args = [pwCli, 'test', specFromBody];

    let stdout = '';
    let stderr = '';

    const child = spawn(nodeExe, args, { cwd: ROOT, env });

    child.stdout.on('data', d => (stdout += d.toString()));
    child.stderr.on('data', d => (stderr += d.toString()));

    child.on('error', (err) => {
      return res.status(200).json({
        ok: false,
        exitCode: -1,
        message: `Error al lanzar proceso: ${err.message}`,
        logs: stdout,
        errors: stderr
      });
    });

    child.on('close', (code) => {
      const ok = code === 0;
      const hasReport = fs.existsSync(path.join(REPORT_DIR, 'index.html'));
      return res.status(200).json({
        ok,
        exitCode: code,
        message: ok ? 'Tests ejecutados' : 'Tests con fallos',
        reportReady: hasReport,
        reportUrl: '/report/',
        downloadUrl: '/download-report',
        logs: stdout,
        errors: stderr
      });
    });
  } catch (e: any) {
    return res.status(200).json({
      ok: false,
      exitCode: -1,
      message: e?.message || String(e),
      logs: '',
      errors: ''
    });
  }
});

// Servir el reporte HTML de Playwright
app.use('/report', express.static(REPORT_DIR));

// Descargar el reporte como ZIP
app.get('/download-report', (req: Request, res: Response) => {
  if (!fs.existsSync(REPORT_DIR)) {
    return res.status(404).json({ ok: false, message: 'No hay reporte. Ejecuta primero las pruebas.' });
  }
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="playwright-report.zip"');

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(REPORT_DIR, false);
  archive.on('error', err => res.status(500).end(err.message));
  archive.pipe(res);
  archive.finalize();
});

// Servir la UI estática
app.use('/', express.static(path.join(ROOT, 'webui')));

// Arranque del servidor
const PORT = 5170;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));
