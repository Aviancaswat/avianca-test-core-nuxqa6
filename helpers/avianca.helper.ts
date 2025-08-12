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

    async wait(ms: number): Promise<void> {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
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

    getCodeContentJS(): string {

        const code = `
        import { SCREENSHOTS_DETAILS } from "./helpers/avianca.helper";
        
            console.log("Código insertado con javascript");
            console.log("SCREENSHOTS_DETAILS: ", SCREENSHOTS_DETAILS);

            export const setCustomsDetails = () => {
                setTimeout(() => {

                    const screenShots = document.querySelectorAll("img.screenshot");

                    screenShots.forEach((screen, index) => {

                        const containerDetails = document.createElement("div");
                        containerDetails.className = "screeshot-details";

                        const titleDetailsHTML = document.createElement("strong");
                        titleDetailsHTML.className = "screenshot-title";
                        titleDetailsHTML.innerText = "Detalles del screeshot";
                        
                        // Aquí se corrige el template string para interpolar el valor de index
                        const titleHTML = document.createElement("strong");
                        titleHTML.innerHTML = \`Paso \${index}: \`;

                        const descriptionHTML = document.createElement("strong");
                        descriptionHTML.innerHTML = \`Detalles: \`;

                        const titleText = document.createElement("span");
                        titleText.innerHTML = SCREENSHOTS_DETAILS[index];
                        const descriptionText = document.createElement("span");
                        descriptionText.innerHTML = SCREENSHOTS_DETAILS[index];

                        containerDetails.appendChild(titleDetailsHTML);
                        containerDetails.appendChild(document.createElement("br"));
                        containerDetails.appendChild(titleHTML);
                        containerDetails.appendChild(titleText);
                        containerDetails.appendChild(document.createElement("br"));
                        containerDetails.appendChild(descriptionHTML);
                        containerDetails.appendChild(descriptionText);

                        screen.parentElement.parentElement.append(containerDetails);
                    })
                }, 3000);
            }
        `;
        return code;
    },

    async createFileContentJS() {

        const filenameJS = 'custom-details.js';
        const filePath = path.join(__dirname, '..', 'playwright-report', filenameJS);

        try {

            const code = this.getCodeContentJS();
            await fs.writeFile(filePath, code);
            console.log("Archivo creado correctamente. Ruta: ", filePath);
        }
        catch (error) {
            console.error(`Ha ocurrido un error al crear el archivo ${filenameJS} | Error: ${error}`);
            throw error;
        }
    },

    async updateFileReport() {
        const reportePath = path.join(__dirname, '..', 'playwright-report', 'index.html');
        console.log('Ruta al archivo HTML:', reportePath);

        try {

            await fs.access(reportePath, fs.constants.F_OK);
            const data = await fs.readFile(reportePath, 'utf8');
            const nuevoCodigoJs = `
                <script type="module">
                    import { setCustomsDetails } from "./custom-details.js";
                    setCustomsDetails();
                </script>
            `;
            const nuevoHtml = data.replace('</body>', `${nuevoCodigoJs}</body>`);
            console.log("nuevoHtml: ", nuevoHtml);
            await fs.writeFile(reportePath, nuevoHtml, 'utf8');
            console.log('Archivo HTML modificado exitosamente');
        } catch (err) {
            console.error('Error al intentar modificar el reporte:', err);
        }
    },

    mainReportFileUpdate(): void {

        try {

            this.createFileContentJS();
            this.updateFileReport();

        }
        catch (error) {
            console.error("Ocurrión un error el en proceso de creación o de actualización de archivo: ", error);
            throw error;
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

