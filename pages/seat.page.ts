import { expect, type Page } from "@playwright/test";
import { GLOBAL_MESSAGES as m } from "../global.variables";
import { PlaywrightHelper as helper } from "../helpers/avianca.helper";
import { copySeat } from "../data/copys/seat/seat.copy";
 
type TPage = Page | undefined | any;
 
export type TSeatPage = {
    seleccionar_asientos_ida(): Promise<void>;
    seleccionar_asiento_tarifa_premium(numero_pasajeros): Promise<void>;
    seleccionar_asiento_tarifa_plus(numero_pasajeros): Promise<void>;
    seleccionar_asiento_tarifa_economy(numero_pasajeros): Promise<void>;
    seleccionar_asiento_tarifa_business(numero_pasajeros): Promise<void>;
    seleccionar_asiento_emergency(numero_pasajeros): Promise<void>;
    seleccionar_asientos(tarifaAsientos,numero_pasajeros): Promise<void>;
    confirmar_asientos_ida(): Promise<void>;
    seleccionar_asientos_regreso(): Promise<void>;
    volver(): Promise<void>;
    ir_a_pagar(): Promise<void>;
    initPage(page: TPage): void;
    run(): Promise<void>;
}
 
let page: TPage;
 
const SeatPage: TSeatPage = {
 
    initPage(pageP: TPage): void {
        page = pageP;
    },
 
     async seleccionar_asientos_ida(): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
                const {
                    seleccionar_asientos,
                } = SeatPage;
                let seleccionarAsientosPorDefecto = copySeat.seleccionarAsientosPorDefecto;
                let continuarAlSiguienteVuelo = copySeat.continuarAlSiguienteVuelo;
                if(!seleccionarAsientosPorDefecto && !continuarAlSiguienteVuelo){
                    await page.waitForTimeout(12000);
                    const cambiarAsientosSeleccionados = copySeat.cambiarAsientosSeleccionados;
                    const tarifaAsientos= copySeat.tarifaDeAsientos;
                    await page.waitForSelector('#seatmapContainer');
                    await page.waitForSelector('.seat-number');
                    await helper.takeScreenshot("Pagina-de-seleccion-asientos");
                    const pasajeros = page.locator(".pax-selector_pax-avatar");
                    await seleccionar_asientos(tarifaAsientos,pasajeros);
                    if(cambiarAsientosSeleccionados){
                        await seleccionar_asientos(tarifaAsientos,pasajeros);
                    }
                }
            }
        catch (error) {
            console.error("ASIENTOS IDA => Ocurrió un error al verificar los asientos de ida | Error: ", error);
            throw error;
        }
    },

    async seleccionar_asientos(tarifaAsientos,pasajeros): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
            const {
                    seleccionar_asiento_tarifa_business,
                    seleccionar_asiento_tarifa_premium,
                    seleccionar_asiento_tarifa_plus,
                    seleccionar_asiento_tarifa_economy,
                    seleccionar_asiento_emergency,
                } = SeatPage;
                switch (tarifaAsientos) {
                    case 'business':
                        await seleccionar_asiento_tarifa_business(pasajeros);
                        break;
                    case 'premium':
                        await seleccionar_asiento_tarifa_premium(pasajeros);
                        break;
                    case 'plus':
                        await seleccionar_asiento_tarifa_plus(pasajeros);
                        break;
                    case 'economy':
                        await seleccionar_asiento_tarifa_economy(pasajeros);
                        break;
                    case 'emergency':
                        await seleccionar_asiento_emergency(pasajeros);
                        break;
                }

        }
        catch (error) {
            console.error("SELECCION ASIENTOS => Ocurrió un error al seleccionar los asientos | Error: ", error);
            throw error;
        }

    },

    async seleccionar_asiento_tarifa_business(pasajeros): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
            const asientosBusiness = page.locator(".seatmap_group--flatbed").locator('.seat-number');
            let i =0;
            for (const e of await pasajeros.all()) {
                await helper.takeScreenshot("seleccion-asiento");
                await expect(page.locator(".seat-number").first()).toBeVisible();
                await asientosBusiness.nth(i).click({ delay: helper.getRandomDelay() });
                await page.waitForTimeout(8000);
                i=i+1;
            }
        }
        catch (error) {
            console.error("SELECCION ASIENTO BUSINESS => Ocurrió un error al seleccionar un asiento business | Error: ", error);
            throw error;
        }
    },

    async seleccionar_asiento_tarifa_premium(pasajeros): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
                const asientosPremium = page.locator(".seatmap_group--premium").locator('.seat-number');
                let i =0;
                for (const e of await pasajeros.all()) {
                    await helper.takeScreenshot("seleccion-asiento");
                    await expect(page.locator(".seat-number").first()).toBeVisible();
                    await asientosPremium.nth(i).click({ delay: helper.getRandomDelay() });
                    await page.waitForTimeout(8000);
                    i=i+1;
                }
            }
        catch (error) {
            console.error("SELECCION ASIENTO PREMIUM => Ocurrió un error al seleccionar un asiento premium | Error: ", error);
            throw error;
        }
    },

    async seleccionar_asiento_tarifa_plus(pasajeros): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
                const asientosPlus = page.locator(".seatmap_group--plus").locator('.seat-number');
                let i =0;
                for (const e of await pasajeros.all()) {
                    await helper.takeScreenshot("seleccion-asiento");
                    await expect(page.locator(".seat-number").first()).toBeVisible();
                    await asientosPlus.nth(i).click({ delay: helper.getRandomDelay() });
                    await page.waitForTimeout(8000);
                    i=i+1;
                }
            }
        catch (error) {
            console.error("SELECCION ASIENTO PLUS => Ocurrió un error al seleccionar un asiento plus | Error: ", error);
            throw error;
        }
    },

    async seleccionar_asiento_tarifa_economy(pasajeros): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
                const asientosEconomy = page.locator(".seatmap_group--economy").locator('.seat-number');
                let i =0;
                for (const e of await pasajeros.all()) {
                    await helper.takeScreenshot("seleccion-asiento");
                    await expect(page.locator(".seat-number").first()).toBeVisible();
                    await asientosEconomy.nth(i).click({ delay: helper.getRandomDelay() });
                    await page.waitForTimeout(8000);
                    i=i+1;
                }
            }
        catch (error) {
            console.error("SELECCION ASIENTO ECONOMY => Ocurrió un error al seleccionar un asiento economy | Error: ", error);
            throw error;
        }
    },

    async seleccionar_asiento_emergency(pasajeros): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try 
        { 
            const asientosEmergency = page.locator(".seatmap_group--emergency").locator('.seat-number');
            let i =0;
            for (const e of await pasajeros.all()) {
                await helper.takeScreenshot("seleccion-asiento");
                await expect(page.locator(".seat-number").first()).toBeVisible();
                await asientosEmergency.nth(i).click({ delay: helper.getRandomDelay() });
                await page.waitForTimeout(8000);
                i=i+1;
            }
        }
        catch (error) {
            console.error("SELECCION ASIENTO EMERGENCY => Ocurrió un error al seleccionar un asiento emergency | Error: ", error);
            throw error;
        }
    },

    async confirmar_asientos_ida(): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
                await page.waitForSelector(".switch-button_item_option");
                await helper.takeScreenshot("seleccion-asiento-vuelta");
                const vueloSiguiente = page.locator(".switch-button_item_option");
                await vueloSiguiente.nth(1).click({ delay: helper.getRandomDelay() });
            }
        catch (error) {
            console.error("CONFIRMAR ASIENTOS IDA => Ocurrió un error al confirmar los asientos de ida | Error: ", error);
            throw error;
        }
    },
 
    async seleccionar_asientos_regreso(): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
                const {
                    seleccionar_asientos,
                } = SeatPage;
                let seleccionarAsientosPorDefecto = copySeat.seleccionarAsientosPorDefecto;
                if(!seleccionarAsientosPorDefecto){
                    await page.waitForTimeout(12000);
                    const cambiarAsientosSeleccionados = copySeat.cambiarAsientosSeleccionados;
                    const tarifaAsientos= copySeat.tarifaDeAsientos;
                    await page.waitForSelector('#seatmapContainer');
                    await page.waitForSelector('.seat-number');
                    await helper.takeScreenshot("Pagina-de-seleccion-asientos");
                    const pasajeros = page.locator(".pax-selector_pax-avatar");
                    await seleccionar_asientos(tarifaAsientos,pasajeros);
                    if(cambiarAsientosSeleccionados){
                        await seleccionar_asientos(tarifaAsientos,pasajeros);
                    }
                }  
            }
        catch (error) {
            console.error("ASIENTOS REGRESO => Ocurrió un error al verificar los asientos de regreso | Error: ", error);
            throw error;
        }
    },
 
    async ir_a_pagar(): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
                const lang = helper.getLang();
                await expect(page.getByRole('button', { name: copySeat[lang].pagar, exact: true })).toBeVisible()
                await page.getByRole('button', { name: copySeat[lang].pagar, exact: true }).click({ delay: helper.getRandomDelay()} );
                await page.waitForTimeout(5000);
            }
        catch (error) {
            console.error("IR A PAGAR => Ocurrió un error al ir a pagar | Error: ", error);
            throw error;
        }
    },

    async volver(): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }
        try {
            await page.waitForTimeout(7000);
            await page.evaluate(() => {
				 history.back();
			});
        }
        catch (error) {
            console.error("VOLVER => Ocurrió un error al volver | Error: ", error);
            throw error;
        }

    },
 
    async run(): Promise<void> {
 
        const {
            seleccionar_asientos_ida,
            confirmar_asientos_ida,
            seleccionar_asientos_regreso,
            ir_a_pagar,
            volver,
        } = SeatPage;
        let volverAModuloServicios = copySeat.volverAModuloServicios;
        if(!volverAModuloServicios){
            console.log("Seats page started...");
            await seleccionar_asientos_ida();
            await confirmar_asientos_ida();
            await seleccionar_asientos_regreso();
            await ir_a_pagar();
            console.log("Seats page ended...");
        }else{
            await volver();
        }
    }
};
 
export { SeatPage };