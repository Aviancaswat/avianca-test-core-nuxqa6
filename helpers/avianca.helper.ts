import type { Page, TestInfo } from "@playwright/test";
import type { Lang } from "../types/copy.type";
import { copys } from "../data/home.deautl.copy";

type Tpage = Page | undefined | any;

let page: Tpage;
let screenshotCounter: number = 0;
let testInfo: TestInfo;

const PlaywrightHelper = {

    init(pageP: Tpage, testInfoP) {
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

    async takeScreenshot(label: string): Promise<void> {

        if (!page) {
            throw new Error("El navegador no ha sido inicializado. Llama al método 'initializeBrowser'");
        }

        try {

            const timestamp = this.getTimestamp();
            const filename = `step${screenshotCounter++}-${label}-${timestamp}.png`;
            testInfo.attach(filename, {
                body: await page.screenshot(),
                contentType: "image/png"
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