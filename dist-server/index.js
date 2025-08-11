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
// Al compilar con tsc, __dirname será .../dist-server
// Subimos un nivel para apuntar a la raíz del proyecto
const ROOT = path_1.default.join(__dirname, '..');
// Rutas usadas por la app
const REPORT_DIR = path_1.default.join(ROOT, 'playwright-report');
const DATA_TESTS_PATH = path_1.default.join(ROOT, 'data', 'config', 'dataTests.ts');
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
    const dir = path_1.default.dirname(DATA_TESTS_PATH);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    if (!fs_1.default.existsSync(DATA_TESTS_PATH)) {
        fs_1.default.writeFileSync(DATA_TESTS_PATH, DATA_TESTS_TEMPLATE, 'utf-8');
    }
}
// Extrae el cuerpo del array tests soportando:
// - con/sin "export"
// - con/sin anotación de tipo
// - punto y coma opcional
function extractArrayBody(code) {
    const re = /(?:export\s+)?const\s+tests\s*(?::\s*[^=]+)?=\s*\[(?<body>[\s\S]*?)\]\s*;?/m;
    const m = code.match(re);
    return m?.groups?.body ?? null;
}
// Reemplaza el contenido del array tests por el bloque recibido
function replaceArrayBody(code, newBody) {
    const re = /(?:export\s+)?const\s+tests\s*(?::\s*[^=]+)?=\s*\[[\s\S]*?\]\s*;?/m;
    const prettyBody = `\n${newBody.trim()}\n`;
    const replacement = `export const tests: TGenericCopys[] = [${prettyBody}];`;
    if (re.test(code)) {
        return code.replace(re, replacement);
    }
    // Si no existía el bloque, devolvemos la plantilla con el bloque insertado
    return DATA_TESTS_TEMPLATE.replace(/export const tests:[\s\S]*?;\s*export \{ tests \};/m, replacement + `\n\nexport { tests };`);
}
// --- Endpoints ---
// Ejecutar pruebas (usa el spec por defecto de tu proyecto)
app.post('/run-tests', async (req, res) => {
    // El front actual no envía spec; dejamos aquí por si en el futuro se usa:
    const specFromBody = req.body?.spec || undefined;
    const headlessFlag = req.body?.headless;
    try {
        // Si envían spec, validamos que exista. Si no, dejamos que Playwright use su config (testDir + reporter html)
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
        // Limpiamos reporte previo si existe
        if (fs_1.default.existsSync(REPORT_DIR)) {
            fs_1.default.rmSync(REPORT_DIR, { recursive: true, force: true });
        }
        // Resolvemos el CLI de @playwright/test y ejecutamos con el mismo Node
        const pwPkg = require.resolve('@playwright/test/package.json', { paths: [ROOT] });
        const pwDir = path_1.default.dirname(pwPkg);
        const pwCli = path_1.default.join(pwDir, 'cli.js');
        // HEADLESS por env (tu config puede leerlo si lo deseas); por defecto 1
        const env = { ...process.env, HEADLESS: '1' };
        if (typeof headlessFlag === 'boolean') {
            env.HEADLESS = headlessFlag ? '1' : '0';
        }
        const nodeExe = process.execPath;
        const args = specFromBody ? [pwCli, 'test', specFromBody] : [pwCli, 'test'];
        let stdout = '';
        let stderr = '';
        const child = (0, child_process_1.spawn)(nodeExe, args, { cwd: ROOT, env });
        child.stdout.on('data', d => (stdout += d.toString()));
        child.stderr.on('data', d => (stderr += d.toString()));
        child.on('error', (err) => {
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
            const hasReport = fs_1.default.existsSync(path_1.default.join(REPORT_DIR, 'index.html'));
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
        return res.status(404).json({ ok: false, message: 'No hay reporte. Ejecuta primero las pruebas.' });
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
            return res.status(400).json({ ok: false, message: 'Envía "block" (string) con el contenido a insertar.' });
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
app.use('/', express_1.default.static(path_1.default.join(ROOT, 'webui')));
// Arranque del servidor (si corres este archivo directamente, útil fuera de Electron)
const PORT = Number(process.env.PORT || 5170);
app.listen(PORT, () => {
    console.log(`Server ready on http://127.0.0.1:${PORT}`);
});
