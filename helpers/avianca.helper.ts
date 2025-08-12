// helpers/avianca.helper.ts
import type { Page, TestInfo } from "@playwright/test";
import path from "path";
import fs from "fs";
import { genericCopys } from "../data/copys";
import { HomeCopy as copys } from "../data/copys/home/home.copy";
import type { Lang } from "../types/copy.type";

type Tpage = Page | undefined | any;

let page: Tpage;
let screenshotCounter = 0;
let testInfo: TestInfo;

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function slug(s: string) {
  return (s || "")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\-_.]+/gi, "")
    .replace(/\s+/g, "")
    .slice(0, 150);
}

const PlaywrightHelper = {
  init(pageP: Tpage, testInfoP: TestInfo) {
    page = pageP;
    testInfo = testInfoP;
  },

  getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
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
      throw new Error("El navegador no ha sido inicializado. Llama a 'initializeBrowser'");
    }
    if (!testInfo) {
      throw new Error("testInfo no ha sido inicializado. Llama a PlaywrightHelper.init(page, testInfo)");
    }

    try {
      const timestamp = this.getTimestamp();
      const idTest = slug(genericCopys.id || "test");
      const foldername = slug(genericCopys.description || "sinDescripcion");
      const fullNameFolder = `${idTest}-${foldername}`;
      const filename = `step${String(screenshotCounter++).padStart(2, "0")}-${slug(label)}-${timestamp}.png`;

      // Base escribible:
      const baseWritable = process.env.APP_USER_DATA_DIR
        ? path.join(process.env.APP_USER_DATA_DIR, "results-by-test")
        : testInfo.outputPath("results-by-test"); // cae al outputDir de Playwright

      const folderPath = path.join(baseWritable, fullNameFolder);
      ensureDir(folderPath);

      const fullPath = path.join(folderPath, filename);

      const buffer = await page.screenshot({ path: fullPath });
      await testInfo.attach(filename, {
        body: buffer,
        contentType: "image/png",
      });
    } catch (error) {
      console.error("Ocurrió un error al tomar el screenshot con nombre", label, error);
      throw error;
    }
  },

  getLang(): Lang {
    return copys.getLang();
  },

  getRandomDelay(): number {
    return Math.random() * (200 - 50) + 50;
  },
};

export { PlaywrightHelper };
