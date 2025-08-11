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

// Al compilar con tsc, __dirname será .../dist-server
// Subimos un nivel para apuntar a la raíz del proyecto
const ROOT = path.join(__dirname, '..');

// Rutas usadas por la app
const REPORT_DIR = path.join(ROOT, 'playwright-report');
const DATA_TESTS_PATH = path.join(ROOT, 'data', 'config', 'dataTests.ts');

// --- Utilidades para dataTests.ts ---

// Plantilla base por si el archivo no existe/viene vacío
const DATA_TESTS_TEMPLATE = `import { TGenericCopys } from "../copys";

export const tests: TGenericCopys[] = [
  // pega aquí tus objetos de prueba, por ejemplo:
  // {
  //   id: "miUnicoId",
  //   description: "ruta de barranquilla a bogotá",
  //   homeCiudadOrigen: "BAQ",
  //   homeCiudadDestino: "BOG",
  //   targetPage: "home"
  // }
];

export { tests };
`;

// Garantiza existencia de carpeta/archivo
function ensureDataTestsFile() {
  const dir = path.dirname(DATA_TESTS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_TESTS_PATH)) {
    fs.writeFileSync(DATA_TESTS_PATH, DATA_TESTS_TEMPLATE, 'utf-8');
  }
}

// Extrae el cuerpo del array tests soportando:
// - con/sin "export"
// - con/sin anotación de tipo
// - punto y coma opcional
function extractArrayBody(code: string): string | null {
  const re =
    /(?:export\s+)?const\s+tests\s*(?::\s*[^=]+)?=\s*\[(?<body>[\s\S]*?)\]\s*;?/m;
  const m = code.match(re);
  return m?.groups?.body ?? null;
}

// Reemplaza el contenido del array tests por el bloque recibido
function replaceArrayBody(code: string, newBody: string): string {
  const re =
    /(?:export\s+)?const\s+tests\s*(?::\s*[^=]+)?=\s*\[[\s\S]*?\]\s*;?/m;
  const prettyBody = `\n${newBody.trim()}\n`;
  const replacement = `export const tests: TGenericCopys[] = [${prettyBody}];`;

  if (re.test(code)) {
    return code.replace(re, replacement);
  }

  // Si no existía el bloque, devolvemos la plantilla con el bloque insertado
  return DATA_TESTS_TEMPLATE.replace(
    /export const tests:[\s\S]*?;\s*export \{ tests \};/m,
    replacement + `\n\nexport { tests };`
  );
}

// --- Endpoints ---

// Ejecutar pruebas (usa el spec por defecto de tu proyecto)
app.post('/run-tests', async (req: Request, res: Response) => {
  // El front actual no envía spec; dejamos aquí por si en el futuro se usa:
  const specFromBody: string | undefined = (req.body?.spec as string) || undefined;
  const headlessFlag: boolean | undefined = req.body?.headless;

  try {
    // Si envían spec, validamos que exista. Si no, dejamos que Playwright use su config (testDir + reporter html)
    if (specFromBody) {
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
    }

    // Limpiamos reporte previo si existe
    if (fs.existsSync(REPORT_DIR)) {
      fs.rmSync(REPORT_DIR, { recursive: true, force: true });
    }

    // Resolvemos el CLI de @playwright/test y ejecutamos con el mismo Node
    const pwPkg = require.resolve('@playwright/test/package.json', { paths: [ROOT] });
    const pwDir = path.dirname(pwPkg);
    const pwCli = path.join(pwDir, 'cli.js');

    // HEADLESS por env (tu config puede leerlo si lo deseas); por defecto 1
    const env = { ...process.env, HEADLESS: '1' };
    if (typeof headlessFlag === 'boolean') {
      env.HEADLESS = headlessFlag ? '1' : '0';
    }

    const nodeExe = process.execPath;
    const args = specFromBody ? [pwCli, 'test', specFromBody] : [pwCli, 'test'];

    let stdout = '';
    let stderr = '';

    const child = spawn(nodeExe, args, { cwd: ROOT, env });

    child.stdout.on('data', d => (stdout += d.toString()));
    child.stderr.on('data', d => (stderr += d.toString()));

    child.on('error', (err: any) => {
      return res.status(200).json({
        ok: false,
        exitCode: -1,
        message: `Error al lanzar proceso: ${err?.message || String(err)}`,
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
  archive.on('error', (err: any) => res.status(500).end(err.message));
  archive.pipe(res);
  archive.finalize();
});

// Obtener el bloque actual para el textarea (limpio)
app.get('/get-tests-body', (req: Request, res: Response) => {
  try {
    ensureDataTestsFile();
    const code = fs.readFileSync(DATA_TESTS_PATH, 'utf-8');
    const body = extractArrayBody(code);
    if (body === null) {
      return res.status(500).json({
        ok: false,
        message: `No se encontró el array "tests" en ${path.relative(ROOT, DATA_TESTS_PATH)}`
      });
    }
    return res.json({ ok: true, body: body.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, message });
  }
});

// Reemplazar todo el contenido del array tests con el bloque pegado
app.post('/set-tests-bulk', (req: Request, res: Response) => {
  try {
    ensureDataTestsFile();

    const block: unknown = req.body?.block;
    if (typeof block !== 'string' || block.trim().length === 0) {
      return res.status(400).json({ ok: false, message: 'Envía "block" (string) con el contenido a insertar.' });
    }

    const code = fs.readFileSync(DATA_TESTS_PATH, 'utf-8');
    const updated = replaceArrayBody(code, block);
    fs.writeFileSync(DATA_TESTS_PATH, updated, 'utf-8');

    return res.json({
      ok: true,
      message: 'Bloque aplicado correctamente',
      file: path.relative(ROOT, DATA_TESTS_PATH)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, message });
  }
});

// Servir la UI estática
app.use('/', express.static(path.join(ROOT, 'webui')));

// Arranque del servidor (si corres este archivo directamente, útil fuera de Electron)
const PORT = Number(process.env.PORT || 5170);
app.listen(PORT, () => {
  console.log(`Server ready on http://127.0.0.1:${PORT}`);
});
