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

// ---- Entornos y rutas base ----
const ENV_APP_ROOT = process.env.APP_ROOT;
const ENV_USER_DATA = process.env.APP_USER_DATA_DIR;
const ENV_REPORT_DIR = process.env.REPORT_DIR;

const DEFAULT_ROOT = path.join(__dirname, '..'); // dist-server/.. → raíz (o resources/app(.asar))
const ROOT = path.resolve(ENV_APP_ROOT || DEFAULT_ROOT);
const IS_ASAR = ROOT.includes('.asar');

// CWD seguro: en empaquetado usar ...\resources (dirname de app.asar); en dev usar ROOT
const EXEC_CWD = IS_ASAR ? path.dirname(ROOT) : ROOT;

// Base escribible (userData en prod, raíz en dev)
const WRITABLE_BASE = path.resolve(
  ENV_USER_DATA || (!IS_ASAR ? ROOT : path.join(process.cwd(), 'data'))
);

// UI estática
const WEBUI_DIR = path.join(ROOT, 'webui');

// dataTests.ts original (lectura) y rutas alternativas
const DATA_TESTS_SRC_PATH = path.join(ROOT, 'data', 'config', 'dataTests.ts');
// Preferencia en empaquetado: carpeta des-empaquetada por asarUnpack (hermana de app.asar)
const UNPACKED_DATA_TESTS = path.join(
  path.dirname(ROOT),
  'app.asar.unpacked',
  'data',
  'config',
  'dataTests.ts'
);

// Espejo escribible (fallback) en userData
const DATA_TESTS_MIRROR_DIR = path.join(WRITABLE_BASE, 'data', 'config');
const DATA_TESTS_MIRROR_PATH = path.join(DATA_TESTS_MIRROR_DIR, 'dataTests.ts');

// Directorio de reportes (escribible)
const REPORT_DIR = path.resolve(
  ENV_REPORT_DIR ||
    (IS_ASAR
      ? path.join(WRITABLE_BASE, 'playwright-report')
      : path.join(ROOT, 'playwright-report'))
);

// ---------- Utils ----------
function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function canWrite(fileOrDir: string): boolean {
  try {
    const target = fs.existsSync(fileOrDir) ? fileOrDir : path.dirname(fileOrDir);
    fs.accessSync(target, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

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

// Logs por ejecución
const LOG_BASE =
  process.env.APP_USER_DATA_DIR || path.join(process.cwd(), 'logs');
ensureDir(LOG_BASE);

function stamp() {
  const z = (n: number) => String(n).padStart(2, '0');
  const d = new Date();
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(
    d.getHours()
  )}-${z(d.getMinutes())}-${z(d.getSeconds())}`;
}
function append(file: string, msg: string) {
  try {
    fs.appendFileSync(file, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {}
}

// Decide el path real y escribible para dataTests.ts
function resolveDataTestsPath(): string {
  // 1) Preferir asarUnpack si existe (instalación con asar y data/config unpacked)
  if (UNPACKED_DATA_TESTS && fs.existsSync(UNPACKED_DATA_TESTS)) {
    return UNPACKED_DATA_TESTS;
  }
  // 2) En dev o asar:false, si el src es escribible, úsalo
  if (canWrite(DATA_TESTS_SRC_PATH)) return DATA_TESTS_SRC_PATH;
  // 3) Fallback: espejo en userData
  ensureDir(DATA_TESTS_MIRROR_DIR);
  if (!fs.existsSync(DATA_TESTS_MIRROR_PATH)) {
    if (fs.existsSync(DATA_TESTS_SRC_PATH)) {
      fs.copyFileSync(DATA_TESTS_SRC_PATH, DATA_TESTS_MIRROR_PATH);
    } else {
      fs.writeFileSync(DATA_TESTS_MIRROR_PATH, DATA_TESTS_TEMPLATE, 'utf-8');
    }
  }
  return DATA_TESTS_MIRROR_PATH;
}

const DATA_TESTS_PATH = resolveDataTestsPath();

function ensureDataTestsFile() {
  const dir = path.dirname(DATA_TESTS_PATH);
  ensureDir(dir);
  if (!fs.existsSync(DATA_TESTS_PATH)) {
    fs.writeFileSync(DATA_TESTS_PATH, DATA_TESTS_TEMPLATE, 'utf-8');
  }
}

function extractArrayBody(code: string): string | null {
  const re =
    /(?:export\s+)?const\s+tests\s*(?::\s*[^=]+)?=\s*\[(?<body>[\s\S]*?)\]\s*;?/m;
  const m = code.match(re);
  return m?.groups?.body ?? null;
}

function replaceArrayBody(code: string, newBody: string): string {
  const re =
    /(?:export\s+)?const\s+tests\s*(?::\s*[^=]+)?=\s*\[[\s\S]*?\]\s*;?/m;
  const prettyBody = `\n${newBody.trim()}\n`;
  const replacement = `export const tests: TGenericCopys[] = [${prettyBody}];`;

  if (re.test(code)) {
    return code.replace(re, replacement);
  }

  return DATA_TESTS_TEMPLATE.replace(
    /export const tests:[\s\S]*?;\s*export \{ tests \};/m,
    replacement + `\n\nexport { tests };`
  );
}

// Localiza el config de Playwright dentro del paquete
function findPlaywrightConfig(): string | null {
  const candidates = [
    'playwright.config.ts',
    'playwright.config.js',
    'playwright.config.mjs',
    'playwright.config.cjs'
  ].map((f) => path.join(ROOT, f));
  for (const f of candidates) {
    if (fs.existsSync(f)) return f;
  }
  return null;
}

// ---------- Endpoints ----------
app.post('/run-tests', async (req: Request, res: Response) => {
  const specFromBody: string | undefined =
    (req.body?.spec as string) || undefined;
  const headlessFlag: boolean | undefined = req.body?.headless;

  try {
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

    // Limpiar reporte previo y asegurar carpeta
    if (fs.existsSync(REPORT_DIR)) {
      try {
        fs.rmSync(REPORT_DIR, { recursive: true, force: true });
      } catch {}
    }
    ensureDir(REPORT_DIR);

    // ENV que usará Playwright en el runner
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      HEADLESS: '1',
      REPORT_DIR
    };
    if (typeof headlessFlag === 'boolean')
      env.HEADLESS = headlessFlag ? '1' : '0';
    env.ELECTRON_RUN_AS_NODE = '1';
    if (!env.APP_ROOT) env.APP_ROOT = ROOT; // por si main no lo pasó

    // Verbose Playwright (opcional para depurar)
    if (!process.env.DEBUG) {
      env.DEBUG = 'pw:api,pw:browser*';
    }

    // 🔎 Diagnóstico: dónde están los tests y el config
    const TEST_DIR = path.join(env.APP_ROOT, 'tests');
    let testExists = fs.existsSync(TEST_DIR);
    let sample = '';
    if (testExists) {
      try {
        const walk = (dir: string): string[] => {
          const out: string[] = [];
          for (const e of fs.readdirSync(dir)) {
            const p = path.join(dir, e);
            const st = fs.statSync(p);
            if (st.isDirectory()) out.push(...walk(p));
            else out.push(p);
          }
          return out;
        };
        const all = walk(TEST_DIR).filter((p) =>
          /\.(test|spec)\.(ts|tsx|js|mjs|cjs)$/.test(p)
        );
        sample = all.slice(0, 5).map((p) => path.relative(TEST_DIR, p)).join(' | ');
        if (all.length === 0) testExists = false;
      } catch {}
    }

    const CONFIG_PATH = findPlaywrightConfig();
    console.log(
      '[run-tests] APP_ROOT =',
      env.APP_ROOT,
      '| EXEC_CWD =',
      EXEC_CWD,
      '| CONFIG =',
      CONFIG_PATH,
      '| TEST_DIR =',
      TEST_DIR,
      'exists=',
      testExists,
      'sample=',
      sample
    );

    if (!CONFIG_PATH) {
      return res.status(200).json({
        ok: false,
        exitCode: -1,
        message:
          'No se encontró playwright.config.* dentro del paquete. Inclúyelo en build.files.',
        logs: '',
        errors: ''
      });
    }

    // Ruta al runner compilado
    const runnerJs = path.join(__dirname, 'run-playwright.js');
    if (!fs.existsSync(runnerJs)) {
      return res.status(200).json({
        ok: false,
        exitCode: -1,
        message: `No existe ${runnerJs}. Compila con: npm run build:server`,
        logs: '',
        errors: ''
      });
    }

    // Ejecutable Electron/Node
    const nodeExe = process.execPath;
    if (!fs.existsSync(nodeExe)) {
      return res.status(200).json({
        ok: false,
        exitCode: -1,
        message: `execPath no existe: ${nodeExe}`,
        logs: '',
        errors: ''
      });
    }
    if (!fs.existsSync(EXEC_CWD)) {
      return res.status(200).json({
        ok: false,
        exitCode: -1,
        message: `EXEC_CWD no existe: ${EXEC_CWD}`,
        logs: '',
        errors: ''
      });
    }

    // Args para el runner → ["<runner.js>", "test", "--config", "<config>", "<spec?>"]
    const args = CONFIG_PATH
      ? (specFromBody
          ? [runnerJs, 'test', '--config', CONFIG_PATH, specFromBody]
          : [runnerJs, 'test', '--config', CONFIG_PATH])
      : (specFromBody ? [runnerJs, 'test', specFromBody] : [runnerJs, 'test']);

    const child = spawn(nodeExe, args, { cwd: EXEC_CWD, env, windowsHide: true });

    // ⬇️ Watchdog / timeout + captura de salida + log a archivo
    let stdout = '';
    let stderr = '';

    let responded = false;
    let killTimer: NodeJS.Timeout;
    let idleWatch: NodeJS.Timeout;

    function finish(payload: any) {
      if (responded) return;
      responded = true;
      clearTimeout(killTimer);
      clearInterval(idleWatch);
      return res.status(200).json(payload);
    }

    // Log por ejecución
    const runId = stamp();
    const runLog = path.join(LOG_BASE, `runner_${runId}.log`);
    append(runLog, `CMD: ${nodeExe} ${args.join(' ')} (cwd=${EXEC_CWD})`);
    append(
      runLog,
      `ENV: HEADLESS=${env.HEADLESS} REPORT_DIR=${env.REPORT_DIR} APP_ROOT=${env.APP_ROOT} DEBUG=${env.DEBUG ?? ''}`
    );

    // Mata la ejecución si se pasa de X tiempo (p. ej., 10 min)
    const KILL_AFTER_MS = 60 * 60 * 1000;
    killTimer = setTimeout(() => {
      append(runLog, `TIMEOUT ${KILL_AFTER_MS}ms → SIGTERM`);
      try {
        child.kill('SIGTERM');
      } catch {}
      setTimeout(() => {
        append(runLog, `forcing SIGKILL`);
        try {
          child.kill('SIGKILL');
        } catch {}
      }, 5000);
    }, KILL_AFTER_MS);

    // (Opcional) watchdog por inactividad
    let lastOutput = Date.now();
    idleWatch = setInterval(() => {
      // console.log('[run-tests] alive', Date.now() - lastOutput, 'ms since last output');
    }, 30_000);

    child.stdout.on('data', (d) => {
      const s = d.toString();
      stdout += s;
      append(runLog, s.trimEnd());
      lastOutput = Date.now();
    });
    child.stderr.on('data', (d) => {
      const s = d.toString();
      stderr += s;
      append(runLog, `[stderr] ${s.trimEnd()}`);
      lastOutput = Date.now();
    });

    child.on('error', (err: any) => {
      append(runLog, `ERROR spawn: ${err?.message || String(err)}`);
      finish({
        ok: false,
        exitCode: -1,
        message: `Error al lanzar proceso: ${err?.message || String(err)}`,
        logs: stdout,
        errors: stderr
      });
    });

    child.on('close', (code) => {
      append(runLog, `EXIT ${code}`);
      const ok = code === 0;
      const hasReportIndex = fs.existsSync(path.join(REPORT_DIR, 'index.html'));
      finish({
        ok,
        exitCode: code ?? -1,
        message: ok ? 'Tests ejecutados' : 'Tests con fallos',
        reportReady: hasReportIndex,
        reportUrl: '/report/',
        downloadUrl: '/download-report',
        logs: stdout,
        errors: stderr
      });
    });
    // ⬆️ Fin watchdog
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
    return res
      .status(404)
      .json({ ok: false, message: 'No hay reporte. Ejecuta primero las pruebas.' });
  }
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="playwright-report.zip"'
  );

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
        message: `No se encontró el array "tests" en ${path.relative(
          ROOT,
          DATA_TESTS_PATH
        )}`
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
      return res
        .status(400)
        .json({ ok: false, message: 'Envía "block" (string) con el contenido a insertar.' });
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
app.use('/', express.static(WEBUI_DIR));

// Arranque del servidor
const PORT = Number(process.env.PORT || 5170);
app.listen(PORT, () => {
  console.log(`Server ready on http://127.0.0.1:${PORT}`);
  console.log(`ROOT=${ROOT}`);
  console.log(`EXEC_CWD=${EXEC_CWD}`);
  console.log(`REPORT_DIR=${REPORT_DIR}`);
  console.log(`DATA_TESTS_PATH=${DATA_TESTS_PATH}`);
});
