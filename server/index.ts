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
const DATA_TESTS_PATH = path.join(ROOT, 'data', 'config', 'dataTests.ts');

// Plantilla base si no existe el archivo
const DATA_TESTS_TEMPLATE = `import { TGenericCopys } from "../copys";

const tests: TGenericCopys[] = [

]

export { tests };
`;

// Asegura que exista carpeta/archivo
function ensureDataTestsFile() {
  const dir = path.dirname(DATA_TESTS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_TESTS_PATH)) {
    fs.writeFileSync(DATA_TESTS_PATH, DATA_TESTS_TEMPLATE, 'utf-8');
  }
}

// Extrae el cuerpo del array tests
function extractArrayBody(code: string): string | null {
  const reArray = /const\s+tests\s*:\s*TGenericCopys\[\]\s*=\s*\[(?<body>[\s\S]*?)\]\s*;/m;
  const m = code.match(reArray);
  return m?.groups?.body ?? null;
}

// Reemplaza el contenido del array tests
function replaceArrayBody(code: string, newBody: string): string {
  const reArray = /const\s+tests\s*:\s*TGenericCopys\[\]\s*=\s*\[[\s\S]*?\]\s*;/m;
  const prettyBody = `\n${newBody.trim()}\n`;
  return code.replace(
    reArray,
    `const tests: TGenericCopys[] = [${prettyBody}];`
  );
}

// === RUTAS ===

// Ejecutar pruebas
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

    if (fs.existsSync(REPORT_DIR)) {
      fs.rmSync(REPORT_DIR, { recursive: true, force: true });
    }

    const pwPkg = require.resolve('@playwright/test/package.json', { paths: [ROOT] });
    const pwDir = path.dirname(pwPkg);
    const pwCli = path.join(pwDir, 'cli.js');

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

// Obtener bloque actual (limpio)
app.get('/get-tests-body', (req: Request, res: Response) => {
  try {
    ensureDataTestsFile();
    const code = fs.readFileSync(DATA_TESTS_PATH, 'utf-8');
    const body = extractArrayBody(code);
    if (body === null) {
      return res.status(500).json({ ok: false, message: 'No se encontró el array tests en dataTests.ts' });
    }
    return res.json({ ok: true, body: body.trim() }); // ← limpiamos espacios/saltos
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, message });
  }
});

// Guardar bloque completo
app.post('/set-tests-bulk', (req: Request, res: Response) => {
  try {
    ensureDataTestsFile();

    const block: unknown = req.body?.block;
    if (typeof block !== 'string' || block.trim().length === 0) {
      return res.status(400).json({ ok: false, message: 'Envía "block" (string) con el contenido a insertar.' });
    }

    const code = fs.readFileSync(DATA_TESTS_PATH, 'utf-8');
    const currentBody = extractArrayBody(code);
    if (currentBody === null) {
      return res.status(500).json({ ok: false, message: 'No se encontró el array tests en dataTests.ts' });
    }

    const updated = replaceArrayBody(code, block);
    fs.writeFileSync(DATA_TESTS_PATH, updated, 'utf-8');

    return res.json({ ok: true, message: 'Bloque aplicado correctamente', file: path.relative(ROOT, DATA_TESTS_PATH) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, message });
  }
});


// Servir reporte HTML
app.use('/report', express.static(REPORT_DIR));

// Descargar reporte ZIP
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

// Servir UI estática
app.use('/', express.static(path.join(ROOT, 'webui')));

// Arrancar servidor
const PORT = 5170;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));
