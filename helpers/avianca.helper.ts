import type { Page, TestInfo } from "@playwright/test";
import path from "path";
import { genericCopys } from "../data/copys";
import { HomeCopy as copys } from "../data/copys/home/home.copy";
import { GLOBAL_MESSAGES as m } from "../global.variables";
import type { Lang } from "../types/copy.type";

type Tpage = Page | undefined | any;

let page: Tpage;
let screenshotCounter: number = 0;
let testInfo: TestInfo;

const PlaywrightHelper = {

    init(pageP: Tpage, testInfoP: TestInfo) {
        page = pageP;
        testInfo = testInfoP;
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

    async setDetailsTestScreenShot({ title, details }: { title: string, details: string }): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (!title || !details) {
            throw new Error("El titulo o los detalles no son válidos. Ingrese un valor válido")
        }

        try {
            
            await testInfo.attach(title, {
                body: Buffer.from(details),
                contentType: 'text/plain',
            });
        }
        catch (error) {
            console.error("DETAILSTESTSCREENSHOT => Ha ocurrido un error al establecer los detalles del screenshot de la test");
            throw error;
        }
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

