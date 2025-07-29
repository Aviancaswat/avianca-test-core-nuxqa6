import type { Browser, BrowserContext, Page } from "@playwright/test";
import { ENVIROMENT_URL as env, GLOBAL_VARIABLES as g, GLOBAL_MESSAGES as m } from "../global.variables";
import { PlaywrightHelper as helper } from "../helpers/avianca.helper";

let page: Page | undefined | any;
let browser: Browser | undefined | any;
let context: BrowserContext | undefined | any;

const AviancaCore = {
    async initializeBrowser(): Promise<void> {
        try {
            const { chromium } = require("playwright-extra");
            browser = await chromium.launch({
                headless: g.headless,
                args: [
                    '--disable-http2',
                    '--disable-blink-features=AutomationControlled',
                    '--enable-webgl',
                    '--use-gl=swiftshader',
                    '--enable-accelerated-2d-canvas'
                ]
            });

            context = await browser?.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 1280, height: 720 },
                locale: 'en-US',
                timezoneId: 'America/New_York',
                deviceScaleFactor: 1,
                // recordVideo: {
                //     dir: 'test-results/videos/',
                //     size: { width: 1280, height: 720 }
                // },
            });

            page = await context?.newPage();

            await page?.addInitScript(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
            });

            return page;
        }
        catch (error) {
            console.error("Error al inicializar el navegador!", error);
            throw error;
        }
    },

    async initTests(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            await page.goto(env.url, {
                waitUntil: "domcontentloaded",
                timeout: 400_000
            });
            await page.waitForSelector("#searchComponentDiv");
            await helper.takeScreenshot("Avianca-home");
        } catch (error) {
            console.log("Ocurrió un error durante la navegación, Error: ", error);
            throw error;
        }
    },

    async closeBrowser(): Promise<void> {
        try {
            if (page) {
                await page.close();
                page = undefined;
            }
            if (context) {
                await context.close();
                context = undefined;
            }
            if (browser) {
                await browser.close();
                browser = undefined;
            }
        } catch (error) {
            console.error('CLOSEBROWSER => Ocurrió un error cerrando el navegador | Error: ', error);
            throw error;
        }
    },

    getPage() {
        if (!page) {
            throw new Error("El navegador no ha sido inicializado. Llama al método 'initializeBrowser'");
        }
        return page;
    }
}

export { AviancaCore };
