import type { Page, TestInfo } from "@playwright/test";
import fs from "fs";
import path from "path";
import { genericCopys } from "../data/copys";
import type { Lang, Position } from "../types/copy.type";
import { Utilities } from "../utils/utilities";

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

    normalizeFilename(filename: string) {
        const sanitized = filename.replace(/[|\\/:*?"<>]/g, '-');
        return sanitized.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
    },

    async takeScreenshot(label: string, descriptionTextImage: string | undefined = "Imagen sin descripción"): Promise<void> {

        if (!page) {
            throw new Error("El navegador no ha sido inicializado. Llama al método 'initializeBrowser'");
        }

        try {

            const descriptionFullScreenshot = this.getMessageDetailsDefault() + "-" + descriptionTextImage;
            const timestamp = this.getTimestamp();
            const idTest = this.normalizeFilename(genericCopys.id?.replaceAll(" ", "").trim());
            const foldername = this.normalizeFilename(genericCopys.description!.replaceAll(" ", ""));
            const filename = this.normalizeFilename(`step${screenshotCounter++}-${label}-${timestamp}.png`);
            const fullNameFolder = `${idTest}-${foldername}`
            const pathScreenshot = path.join(__dirname, '..', 'results-by-test', fullNameFolder, filename);
            await page.screenshot({ path: pathScreenshot });
            await Utilities.addTextToImage(pathScreenshot, descriptionFullScreenshot);

            testInfo.attach(filename, {
                body: fs.readFileSync(pathScreenshot),
                contentType: "image/png",
            });

        } catch (error) {
            console.error("Ocurrió un error al tomar el screenshot con nombre ", label);
            throw error;
        }
    },
    getLang(): Lang {
        return genericCopys.language ?? "es";
    },
    getRandomDelay(): number {
        return Math.random() * (200 - 50) + 50;
    },
    getPosition(): Position {
        return genericCopys.position ?? "CO"
    },
    getTotalPassengers(): number {
        const numberPs = genericCopys.homePassengerAdults! + genericCopys.homePassengerYouths! + genericCopys.homePassengerChildren! + genericCopys.homePassengerInfant!;
        return numberPs + 1;
    },
    getMessageDetailsDefault(): string {
        const messageDefault = `${genericCopys.id}-${genericCopys.description}-${this.getLang()}-${this.getPosition()}`;
        return messageDefault;
    }
}

export { PlaywrightHelper };

