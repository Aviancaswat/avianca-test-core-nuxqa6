// core/avianca.core.ts
import type { Browser, BrowserContext, Page, LaunchOptions } from "playwright";
import { chromium } from "playwright";
import https from "https";
import dns from "dns/promises";

// Tus globals (ajusta la ruta si cambia la ubicación de global.variables.ts)
import {
  ENVIROMENT_URL as env,
  GLOBAL_VARIABLES as g,
  GLOBAL_MESSAGES as m,
} from "../global.variables";

let browser: Browser | undefined;
let context: BrowserContext | undefined;
let page: Page | undefined;

/**
 * Diagnóstico previo: resuelve DNS y hace un HEAD al host.
 * No falla la prueba si esto falla, pero deja logs útiles.
 */
async function preflight(urlStr: string) {
  try {
    const u = new URL(urlStr);
    const ip = await dns.lookup(u.hostname);
    console.warn("[preflight] DNS", u.hostname, "->", ip.address);

    await new Promise<void>((resolve, reject) => {
      const req = https.request(
        {
          method: "HEAD",
          hostname: u.hostname,
          path: u.pathname || "/",
          port: u.port || 443,
          rejectUnauthorized: false, // tolera TLS corporativo
          timeout: 15000,
        },
        (res) => {
          console.warn("[preflight] HEAD status", res.statusCode);
          resolve();
        }
      );
      req.on("error", reject);
      req.on("timeout", () => reject(new Error("HEAD timeout")));
      req.end();
    });
  } catch (e: any) {
    console.warn("[preflight] error", e?.message || String(e));
  }
}

/**
 * Navegación robusta: primero espera "commit" (rápido), luego "domcontentloaded".
 * Reintenta 3 veces con pequeños delays.
 */
async function safeGoto(p: Page, url: string) {
  const attempts = 3;
  for (let i = 1; i <= attempts; i++) {
    try {
      // 1) llegar a commit rápido
      await p.goto(url, { waitUntil: "commit", timeout: 30_000 });
      // 2) luego esperar DOMContentLoaded con timeout moderado
      await p.waitForLoadState("domcontentloaded", { timeout: 30_000 });
      return;
    } catch (err: any) {
      console.warn(
        `[safeGoto] intento ${i}/${attempts} ->`,
        err?.message || String(err)
      );
      if (i === attempts) throw err;
      await p.waitForTimeout(2000);
    }
  }
}

export class AviancaCore {
  /**
   * Lanza el navegador y abre un contexto/página listos para usar.
   * Lee HEADLESS de env y aplica proxy si está definido en el entorno.
   */

  static async close() {
    try {
      await page?.close();
    } catch {}
    try {
      await context?.close();
    } catch {}
    try {
      await browser?.close();
    } catch {}
  }

  // ✅ alias para compatibilidad con el spec actual
  static async closeBrowser() {
    return this.close();
  }
  static async initializeBrowser(): Promise<void> {
    try {
      const isHeadless =
        process.env.HEADLESS === "0"
          ? false
          : typeof g?.headless === "boolean"
          ? g.headless
          : true;

      // Proxy opcional desde el entorno (útil en redes corporativas)
      const PROXY =
        process.env.HTTPS_PROXY ||
        process.env.HTTP_PROXY ||
        process.env.ALL_PROXY ||
        undefined;

      const launchOptions: LaunchOptions = {
        headless: isHeadless,
        channel: "chrome", // ← si prefieres usar Chrome del sistema, descomenta esto
        proxy: PROXY ? { server: PROXY } : undefined,
        args: [
          "--ignore-certificate-errors",
          "--allow-insecure-localhost",
          "--disable-features=BlockInsecurePrivateNetworkRequests",
          "--disable-http2", // si tu backend tiene líos con HTTP/2
          "--disable-blink-features=AutomationControlled",
          "--no-sandbox",
        ],
      };

      browser = await chromium.launch(launchOptions);

      context = await browser.newContext({
        ignoreHTTPSErrors: true,
        viewport: { width: 1700, height: 1600 },
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        locale: "es-ES",
        extraHTTPHeaders: {
          "accept-language": "es-ES,es;q=0.9",
        },
      });

      page = await context.newPage();

      // Logs de red: respuestas 4xx/5xx y fallos de request
      page.on("response", (resp) => {
        if (resp.status() >= 400) {
          console.warn("[response]", resp.status(), resp.url());
        }
      });
      page.on("requestfailed", (r) => {
        console.warn("[requestfailed]", r.url(), r.failure()?.errorText);
      });

      // Puedes inyectar scripts anti-detección, etc., si hace falta
      await page.addInitScript(() => {
        // @ts-ignore
        Object.defineProperty(navigator, "webdriver", { get: () => false });
      });
    } catch (err: any) {
      console.error(
        "Error al inicializar el navegador!",
        err?.stack || err?.message || String(err)
      );
      throw err;
    }
  }

  /**
   * Arranca el flujo de la prueba: preflight y navegación inicial a env.url
   */
  static async initTests(): Promise<void> {
    if (!page)
      throw new Error(
        "Page no inicializada. Llama primero a initializeBrowser()."
      );

    // Diagnóstico de red previo
    await preflight(env.url);

    // Navegación robusta con reintentos
    await safeGoto(page, env.url);
  }

  static getPage(): Page {
    if (!page)
      throw new Error(
        "Page no inicializada. Llama primero a initializeBrowser()."
      );
    return page;
  }

}
