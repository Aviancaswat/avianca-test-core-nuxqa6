"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const archiver_1 = __importDefault(require("archiver"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ---- Entornos y rutas base ----
const ENV_APP_ROOT = process.env.APP_ROOT;
const ENV_USER_DATA = process.env.APP_USER_DATA_DIR;
const ENV_REPORT_DIR = process.env.REPORT_DIR;
const DEFAULT_ROOT = path_1.default.join(__dirname, '..'); // dist-server/.. → raíz (o resources/app(.asar))
const ROOT = path_1.default.resolve(ENV_APP_ROOT || DEFAULT_ROOT);
const IS_ASAR = ROOT.includes('.asar');
// CWD seguro: en empaquetado usar ...\resources (dirname de app.asar); en dev usar ROOT
const EXEC_CWD = IS_ASAR ? path_1.default.dirname(ROOT) : ROOT;
// Base escribible (userData en prod, raíz en dev)
const WRITABLE_BASE = path_1.default.resolve(ENV_USER_DATA || (!IS_ASAR ? ROOT : path_1.default.join(process.cwd(), 'data')));
// UI estática
const WEBUI_DIR = path_1.default.join(ROOT, 'webui');
// dataTests.ts original (lectura) y rutas alternativas
const DATA_TESTS_SRC_PATH = path_1.default.join(ROOT, 'data', 'config', 'dataTests.ts');
// Preferencia en empaquetado: carpeta des-empaquetada por asarUnpack (hermana de app.asar)
const UNPACKED_DATA_TESTS = path_1.default.join(path_1.default.dirname(ROOT), 'app.asar.unpacked', 'data', 'config', 'dataTests.ts');
// Espejo escribible (fallback) en userData
const DATA_TESTS_MIRROR_DIR = path_1.default.join(WRITABLE_BASE, 'data', 'config');
const DATA_TESTS_MIRROR_PATH = path_1.default.join(DATA_TESTS_MIRROR_DIR, 'dataTests.ts');
// Directorio de reportes (escribible)
const REPORT_DIR = path_1.default.resolve(ENV_REPORT_DIR ||
    (IS_ASAR
        ? path_1.default.join(WRITABLE_BASE, 'playwright-report')
        : path_1.default.join(ROOT, 'playwright-report')));
// ---------- Utils ----------
function ensureDir(p) {
    if (!fs_1.default.existsSync(p))
        fs_1.default.mkdirSync(p, { recursive: true });
}
function canWrite(fileOrDir) {
    try {
        const target = fs_1.default.existsSync(fileOrDir) ? fileOrDir : path_1.default.dirname(fileOrDir);
        fs_1.default.accessSync(target, fs_1.default.constants.W_OK);
        return true;
    }
    catch {
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
const LOG_BASE = process.env.APP_USER_DATA_DIR || path_1.default.join(process.cwd(), 'logs');
ensureDir(LOG_BASE);
function stamp() {
    const z = (n) => String(n).padStart(2, '0');
    const d = new Date();
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}-${z(d.getMinutes())}-${z(d.getSeconds())}`;
}
function append(file, msg) {
    try {
        fs_1.default.appendFileSync(file, `[${new Date().toISOString()}] ${msg}\n`);
    }
    catch { }
}
// Decide el path real y escribible para dataTests.ts
function resolveDataTestsPath() {
    // 1) Preferir asarUnpack si existe (instalación con asar y data/config unpacked)
    if (UNPACKED_DATA_TESTS && fs_1.default.existsSync(UNPACKED_DATA_TESTS)) {
        return UNPACKED_DATA_TESTS;
    }
    // 2) En dev o asar:false, si el src es escribible, úsalo
    if (canWrite(DATA_TESTS_SRC_PATH))
        return DATA_TESTS_SRC_PATH;
    // 3) Fallback: espejo en userData
    ensureDir(DATA_TESTS_MIRROR_DIR);
    if (!fs_1.default.existsSync(DATA_TESTS_MIRROR_PATH)) {
        if (fs_1.default.existsSync(DATA_TESTS_SRC_PATH)) {
            fs_1.default.copyFileSync(DATA_TESTS_SRC_PATH, DATA_TESTS_MIRROR_PATH);
        }
        else {
            fs_1.default.writeFileSync(DATA_TESTS_MIRROR_PATH, DATA_TESTS_TEMPLATE, 'utf-8');
        }
    }
    return DATA_TESTS_MIRROR_PATH;
}
const DATA_TESTS_PATH = resolveDataTestsPath();
function ensureDataTestsFile() {
    const dir = path_1.default.dirname(DATA_TESTS_PATH);
    ensureDir(dir);
    if (!fs_1.default.existsSync(DATA_TESTS_PATH)) {
        fs_1.default.writeFileSync(DATA_TESTS_PATH, DATA_TESTS_TEMPLATE, 'utf-8');
    }
}
function extractArrayBody(code) {
    const re = /(?:export\s+)?const\s+tests\s*(?::\s*[^=]+)?=\s*\[(?<body>[\s\S]*?)\]\s*;?/m;
    const m = code.match(re);
    return m?.groups?.body ?? null;
}
function replaceArrayBody(code, newBody) {
    const re = /(?:export\s+)?const\s+tests\s*(?::\s*[^=]+)?=\s*\[[\s\S]*?\]\s*;?/m;
    const prettyBody = `\n${newBody.trim()}\n`;
    const replacement = `export const tests: TGenericCopys[] = [${prettyBody}];`;
    if (re.test(code)) {
        return code.replace(re, replacement);
    }
    return DATA_TESTS_TEMPLATE.replace(/export const tests:[\s\S]*?;\s*export \{ tests \};/m, replacement + `\n\nexport { tests };`);
}
// Localiza el config de Playwright dentro del paquete
function findPlaywrightConfig() {
    const candidates = [
        'playwright.config.ts',
        'playwright.config.js',
        'playwright.config.mjs',
        'playwright.config.cjs'
    ].map((f) => path_1.default.join(ROOT, f));
    for (const f of candidates) {
        if (fs_1.default.existsSync(f))
            return f;
    }
    return null;
}
// ---------- Endpoints ----------
app.post('/run-tests', async (req, res) => {
    const specFromBody = req.body?.spec || undefined;
    const headlessFlag = req.body?.headless;
    try {
        if (specFromBody) {
            const specAbs = path_1.default.join(ROOT, specFromBody);
            if (!fs_1.default.existsSync(specAbs)) {
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
        if (fs_1.default.existsSync(REPORT_DIR)) {
            try {
                fs_1.default.rmSync(REPORT_DIR, { recursive: true, force: true });
            }
            catch { }
        }
        ensureDir(REPORT_DIR);
        // ENV que usará Playwright en el runner
        const env = {
            ...process.env,
            HEADLESS: '1',
            REPORT_DIR
        };
        if (typeof headlessFlag === 'boolean')
            env.HEADLESS = headlessFlag ? '1' : '0';
        env.ELECTRON_RUN_AS_NODE = '1';
        if (!env.APP_ROOT)
            env.APP_ROOT = ROOT; // por si main no lo pasó
        // Verbose Playwright (opcional para depurar)
        if (!process.env.DEBUG) {
            env.DEBUG = 'pw:api,pw:browser*';
        }
        // 🔎 Diagnóstico: dónde están los tests y el config
        const TEST_DIR = path_1.default.join(env.APP_ROOT, 'tests');
        let testExists = fs_1.default.existsSync(TEST_DIR);
        let sample = '';
        if (testExists) {
            try {
                const walk = (dir) => {
                    const out = [];
                    for (const e of fs_1.default.readdirSync(dir)) {
                        const p = path_1.default.join(dir, e);
                        const st = fs_1.default.statSync(p);
                        if (st.isDirectory())
                            out.push(...walk(p));
                        else
                            out.push(p);
                    }
                    return out;
                };
                const all = walk(TEST_DIR).filter((p) => /\.(test|spec)\.(ts|tsx|js|mjs|cjs)$/.test(p));
                sample = all.slice(0, 5).map((p) => path_1.default.relative(TEST_DIR, p)).join(' | ');
                if (all.length === 0)
                    testExists = false;
            }
            catch { }
        }
        const CONFIG_PATH = findPlaywrightConfig();
        console.log('[run-tests] APP_ROOT =', env.APP_ROOT, '| EXEC_CWD =', EXEC_CWD, '| CONFIG =', CONFIG_PATH, '| TEST_DIR =', TEST_DIR, 'exists=', testExists, 'sample=', sample);
        if (!CONFIG_PATH) {
            return res.status(200).json({
                ok: false,
                exitCode: -1,
                message: 'No se encontró playwright.config.* dentro del paquete. Inclúyelo en build.files.',
                logs: '',
                errors: ''
            });
        }
        // Ruta al runner compilado
        const runnerJs = path_1.default.join(__dirname, 'run-playwright.js');
        if (!fs_1.default.existsSync(runnerJs)) {
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
        if (!fs_1.default.existsSync(nodeExe)) {
            return res.status(200).json({
                ok: false,
                exitCode: -1,
                message: `execPath no existe: ${nodeExe}`,
                logs: '',
                errors: ''
            });
        }
        if (!fs_1.default.existsSync(EXEC_CWD)) {
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
        const child = (0, child_process_1.spawn)(nodeExe, args, { cwd: EXEC_CWD, env, windowsHide: true });
        // ⬇️ Watchdog / timeout + captura de salida + log a archivo
        let stdout = '';
        let stderr = '';
        let responded = false;
        let killTimer;
        let idleWatch;
        function finish(payload) {
            if (responded)
                return;
            responded = true;
            clearTimeout(killTimer);
            clearInterval(idleWatch);
            return res.status(200).json(payload);
        }
        // Log por ejecución
        const runId = stamp();
        const runLog = path_1.default.join(LOG_BASE, `runner_${runId}.log`);
        append(runLog, `CMD: ${nodeExe} ${args.join(' ')} (cwd=${EXEC_CWD})`);
        append(runLog, `ENV: HEADLESS=${env.HEADLESS} REPORT_DIR=${env.REPORT_DIR} APP_ROOT=${env.APP_ROOT} DEBUG=${env.DEBUG ?? ''}`);
        // Mata la ejecución si se pasa de X tiempo (p. ej., 10 min)
        const KILL_AFTER_MS = 10 * 60 * 1000;
        killTimer = setTimeout(() => {
            append(runLog, `TIMEOUT ${KILL_AFTER_MS}ms → SIGTERM`);
            try {
                child.kill('SIGTERM');
            }
            catch { }
            setTimeout(() => {
                append(runLog, `forcing SIGKILL`);
                try {
                    child.kill('SIGKILL');
                }
                catch { }
            }, 5000);
        }, KILL_AFTER_MS);
        // (Opcional) watchdog por inactividad
        let lastOutput = Date.now();
        idleWatch = setInterval(() => {
            // console.log('[run-tests] alive', Date.now() - lastOutput, 'ms since last output');
        }, 30000);
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
        child.on('error', (err) => {
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
            const hasReportIndex = fs_1.default.existsSync(path_1.default.join(REPORT_DIR, 'index.html'));
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
    }
    catch (e) {
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
app.use('/report', express_1.default.static(REPORT_DIR));
// Descargar el reporte como ZIP
app.get('/download-report', (req, res) => {
    if (!fs_1.default.existsSync(REPORT_DIR)) {
        return res
            .status(404)
            .json({ ok: false, message: 'No hay reporte. Ejecuta primero las pruebas.' });
    }
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="playwright-report.zip"');
    const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
    archive.directory(REPORT_DIR, false);
    archive.on('error', (err) => res.status(500).end(err.message));
    archive.pipe(res);
    archive.finalize();
});
// Obtener el bloque actual para el textarea (limpio)
app.get('/get-tests-body', (req, res) => {
    try {
        ensureDataTestsFile();
        const code = fs_1.default.readFileSync(DATA_TESTS_PATH, 'utf-8');
        const body = extractArrayBody(code);
        if (body === null) {
            return res.status(500).json({
                ok: false,
                message: `No se encontró el array "tests" en ${path_1.default.relative(ROOT, DATA_TESTS_PATH)}`
            });
        }
        return res.json({ ok: true, body: body.trim() });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(500).json({ ok: false, message });
    }
});
// Reemplazar todo el contenido del array tests con el bloque pegado
app.post('/set-tests-bulk', (req, res) => {
    try {
        ensureDataTestsFile();
        const block = req.body?.block;
        if (typeof block !== 'string' || block.trim().length === 0) {
            return res
                .status(400)
                .json({ ok: false, message: 'Envía "block" (string) con el contenido a insertar.' });
        }
        const code = fs_1.default.readFileSync(DATA_TESTS_PATH, 'utf-8');
        const updated = replaceArrayBody(code, block);
        fs_1.default.writeFileSync(DATA_TESTS_PATH, updated, 'utf-8');
        return res.json({
            ok: true,
            message: 'Bloque aplicado correctamente',
            file: path_1.default.relative(ROOT, DATA_TESTS_PATH)
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(500).json({ ok: false, message });
    }
});
// Servir la UI estática
app.use('/', express_1.default.static(WEBUI_DIR));
// Arranque del servidor
const PORT = Number(process.env.PORT || 5170);
app.listen(PORT, () => {
    console.log(`Server ready on http://127.0.0.1:${PORT}`);
    console.log(`ROOT=${ROOT}`);
    console.log(`EXEC_CWD=${EXEC_CWD}`);
    console.log(`REPORT_DIR=${REPORT_DIR}`);
    console.log(`DATA_TESTS_PATH=${DATA_TESTS_PATH}`);
});
