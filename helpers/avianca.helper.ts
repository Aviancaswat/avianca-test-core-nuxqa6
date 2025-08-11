import type { Page, TestInfo } from "@playwright/test";
import { promises as fs } from 'fs';
import path from "path";
import { genericCopys } from "../data/copys";
import { HomeCopy as copys } from "../data/copys/home/home.copy";
import type { Lang, TScreenshotDetails } from "../types/copy.type";

type Tpage = Page | undefined | any;

let page: Tpage;
let screenshotCounter: number = 0;
let testInfo: TestInfo;
export let SCREENSHOTS_DETAILS: TScreenshotDetails[] = [];

const PlaywrightHelper = {

    init(pageP: Tpage, testInfoP: TestInfo) {
        page = pageP;
        testInfo = testInfoP;
        SCREENSHOTS_DETAILS = [];
    },

    getTimestamp(): string {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const dd = pad(now.getDate());
        const mm = pad(now.getMonth() + 1);
        const yyyy = now.getFullYear();
        const hh = pad(now.getHours());
        const mi = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        return `${dd}_${mm}_${yyyy}-${hh}_${mi}_${ss}`;
    },

    async updateFileReport() {
        const reportePath = path.join(__dirname, '..', 'playwright-report', 'index.html');

        // Imprimir la ruta para verificar que es la correcta
        console.log('Ruta al archivo HTML:', reportePath);

        try {
            // Verificar si el archivo existe
            await fs.access(reportePath, fs.constants.F_OK);

            // Leer el contenido del archivo HTML
            const data = await fs.readFile(reportePath, 'utf8');

            // Agregar el código JS justo antes de la etiqueta </body>
            const nuevoCodigoJs = `
            <script>
                console.log("Este es un código JS añadido dinámicamente.");
                alert("¡Prueba exitosa!");
            </script>
        `;

            // Insertar el script antes de </body>
            const nuevoHtml = data.replace('</body>', `${nuevoCodigoJs}</body>`);

            // Guardar el archivo modificado
            await fs.writeFile(reportePath, nuevoHtml, 'utf8');
            console.log('Archivo HTML modificado exitosamente');
        } catch (err) {
            console.error('Error al intentar modificar el reporte:', err);
        }
    },

    async addDetailsScreenShot({ title, details }: TScreenshotDetails): Promise<void> {
        if (!title || !details) throw new Error("El titulo o los detalles no son válidos. Ingrese un valor válido")
        SCREENSHOTS_DETAILS.push({ title, details })
    },

    async takeScreenshot(label: string): Promise<void> {

        if (!page) {
            throw new Error("El navegador no ha sido inicializado. Llama al método 'initializeBrowser'");
        }

        try {

            const timestamp = this.getTimestamp();
            const idTest = genericCopys.id;
            const foldername = genericCopys.description!.replaceAll(" ", "");
            const filename = `step${screenshotCounter++}-${label}-${timestamp}.png`
            const fullNameFolder = `${idTest}-${foldername}`
            const pathScreenshot = path.join(__dirname, '..', 'results-by-test', fullNameFolder, filename);

            testInfo.attach(filename, {
                body: await page.screenshot({
                    path: pathScreenshot
                }),
                contentType: "image/png",
            });

        } catch (error) {
            console.error("Ocurrió un error al tomar el screenshot con nombre ", label);
            throw error;
        }
    },
    getLang(): Lang {
        return copys.getLang();
    },
    getRandomDelay(): number {
        return Math.random() * (200 - 50) + 50;
    }
}

export { PlaywrightHelper };

