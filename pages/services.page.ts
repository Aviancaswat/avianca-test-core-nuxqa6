import { expect, type Page } from "@playwright/test";
import { GLOBAL_MESSAGES as m } from "../global.variables";
import { PlaywrightHelper as helper } from "../helpers/avianca.helper";

type TPage = Page | undefined | any;

export type TServicesPage = {
    initPage(page: TPage): void;
    selectBusinessLounge(): Promise<void>;
    selectSpecialAssistance(): Promise<void>;
    selectTravelAssistance(): Promise<void>;
    confirmServices(): Promise<void>;
    run(): Promise<void>;
}

let page: TPage;

const ServicesPage: TServicesPage = {
    initPage(pageP: TPage): void {
        page = pageP;
    },

    async selectBusinessLounge(): Promise<void> {
        if (!page) throw new Error(m.errors.initializated);

        try {
            await helper.takeScreenshot("Pagina-de-servicios");
            await expect(page.locator("#serviceButtonTypeBusinessLounge")).toBeVisible();
            await page.locator('#serviceButtonTypeBusinessLounge').click({ delay: helper.getRandomDelay() });
            await page.waitForSelector(".service_item_button.button");
            await page.locator('.service_item_button.button').first().click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("Servicio avianca-lounges");
            await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: helper.getRandomDelay() });
        } catch (error) {
            console.error("SERVICESPAGE => Error al seleccionar Business Lounge | Error: ", error);
            throw error;
        }
    },

    async selectSpecialAssistance(): Promise<void> {
        if (!page) throw new Error(m.errors.initializated);

        try {
            await expect(page.locator("#serviceButtonTypeSpecialAssistance")).toBeVisible();
            await page.locator('#serviceButtonTypeSpecialAssistance').click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("Servicio asistencia especial");
            await page.waitForSelector(".service_item_button.button");
            await page.locator('.service_item_button.button').first().click({ delay: helper.getRandomDelay() });
            await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted').last().click({ delay: helper.getRandomDelay() });
        } catch (error) {
            console.error("SERVICESPAGE => Error al seleccionar Asistencia Especial | Error: ", error);
            throw error;
        }
    },

    async selectTravelAssistance(): Promise<void> {
        if (!page) throw new Error(m.errors.initializated);

        try {
            await expect(page.locator('.services-card_action_button.button').last()).toBeVisible();
            await helper.takeScreenshot("Asistencia en viaje");
            await page.locator('.services-card_action_button.button').last().click({ delay: helper.getRandomDelay() });
            await page.waitForSelector(".button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton");
            await page.locator('.button.amount-summary_button.amount-summary_button-action.is-action.ng-star-inserted.FB-newConfirmButton').click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("Servicios añadidos");
        } catch (error) {
            console.error("SERVICESPAGE => Error al seleccionar Asistencia en Viaje | Error: ", error);
            throw error;
        }
    },

    async confirmServices(): Promise<void> {
        if (!page) throw new Error(m.errors.initializated);

        try {
            await expect(page.locator(".button_label").last()).toBeVisible();
            await page.locator('.button_label').last().click({ delay: helper.getRandomDelay() });

            const upsellService = await page.locator('.terciary-button').last().isVisible();
            if (upsellService) {
                await page.locator('.terciary-button').last().click({ delay: helper.getRandomDelay() });
            }
        } catch (error) {
            console.error("SERVICESPAGE => Error en la confirmación final de servicios | Error: ", error);
            throw error;
        }
    },

    async run(): Promise<void> {
        console.log("Services page started...");
        // await this.selectBusinessLounge();
        // await this.selectSpecialAssistance();
        // await this.selectTravelAssistance();
        await this.confirmServices();
        console.log("Services page ended...");
    }
};

export { ServicesPage };
