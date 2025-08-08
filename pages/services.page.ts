import { expect, type Page } from "@playwright/test";
import { GLOBAL_MESSAGES as m } from "../global.variables";
import { PlaywrightHelper as helper } from "../helpers/avianca.helper";
import { copyServices } from "../data/copys/services/services.copy";

type TPage = Page | undefined | any;

export type TServicesPage = {
    initPage(page: TPage): void;
    selectExtraLuggage(): Promise<void>;
    selectSportsEquipment(): Promise<void>;
    selectPriorityApproach(): Promise<void>;
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
    async selectExtraLuggage(): Promise<void> {
        if (copyServices.servicesEquipajeManoBodega) {
            try {
                const baggageOptions: { key: keyof typeof copyServices.servicesEquipajeManoBodega; index: number; label: string }[] = [
                    { key: "servicesEquipajeManoIda", index: 0, label: "Añadir equipaje de mano ida" },
                    { key: "servicesEquipajeBodegaIda", index: 1, label: "Añadir equipaje en bodega ida" },
                    { key: "servicesEquipajeManoVuelta", index: 2, label: "Añadir equipaje de mano vuelta" },
                    { key: "servicesEquipajeBodegaVuelta", index: 3, label: "Añadir equipaje en bodega vuelta" }
                ];

                await page.waitForSelector(".services-cards_item.ng-star-inserted");
                await page.locator(".services-cards_item.ng-star-inserted").nth(0).click({ delay: helper.getRandomDelay() });
                await page.waitForSelector(".modal-service_selector.ng-star-inserted");

                for (const { key, index, label } of baggageOptions) {
                    if (copyServices.servicesEquipajeManoBodega[key]) {
                        await page.locator(".ui-num-ud_button.plus").nth(index).click({ delay: helper.getRandomDelay() });
                        await helper.takeScreenshot(label);
                    }
                }

                await helper.takeScreenshot("Equipaje añadido");
                await page.locator(".amount-summary_button.amount-summary_button--action.ds-button.ng-star-inserted").click({ delay: helper.getRandomDelay() });
            } catch (error) {
                console.error("SERVICESPAGE => Error al seleccionar equipaje de mano y bodega | Error: ", error);
                throw error;
            }
        }

    },
    async selectSportsEquipment(): Promise<void> {
        if (copyServices.servicesEquipajeDeportivo) {
            try {
                const sportsBaggageOptions: {
                    key: keyof typeof copyServices.servicesEquipajeDeportivo;
                    index: number;
                    label: string;
                }[] = [
                        { key: "servicesDeportivoBicicletaIda", index: 0, label: "Añadir bicicleta ida" },
                        { key: "servicesDeportivoGolfIda", index: 1, label: "Añadir golf ida" },
                        { key: "servicesDeportivoBuceoIda", index: 2, label: "Añadir Buceo ida" },
                        { key: "servicesDeportivoSurfIda", index: 3, label: "Añadir surf ida" },
                        { key: "servicesDeportivoEsquiarIda", index: 4, label: "Añadir esquiar ida" },
                        { key: "servicesDeportivoBicicletaVuelta", index: 5, label: "Añadir bicicleta vuelta" },
                        { key: "servicesDeportivoGolfVuelta", index: 6, label: "Añadir golf vuelta" },
                        { key: "servicesDeportivoBuceoVuelta", index: 7, label: "Añadir buceo vuelta" },
                        { key: "servicesDeportivoSurfVuelta", index: 8, label: "Añadir surf vuelta" },
                        { key: "servicesDeportivoEsquiarVuelta", index: 9, label: "Añadir esquiar vuelta" }
                    ];

                await page.waitForSelector(".services-cards_item.ng-star-inserted");
                await page.locator(".services-cards_item.ng-star-inserted").nth(1).click({ delay: helper.getRandomDelay() });
                await page.waitForSelector(".modal-service_selector.ng-star-inserted");

                for (const { key, index, label } of sportsBaggageOptions) {
                    const quantity = copyServices.servicesEquipajeDeportivo[key];
                    if (quantity && quantity > 0) {
                        for (let i = 0; i < quantity; i++) {
                            await page.locator(".ui-num-ud_button.plus").nth(index).click({ delay: helper.getRandomDelay() });
                            await helper.takeScreenshot(label);
                        }
                    }
                }

                await helper.takeScreenshot("Equipaje deportivo añadido");
                await page.locator(".amount-summary_button.amount-summary_button--action.ds-button.ng-star-inserted").click({ delay: helper.getRandomDelay() });
            } catch (error) {
                console.error("SERVICESPAGE => Error al seleccionar equipaje deportivo | Error: ", error);
                throw error;
            }
        }

    },
    async selectPriorityApproach(): Promise<void> {
        if (copyServices.servicesAbordajePrioritario) {
            try {
                await page.waitForSelector(".services-cards_item.ng-star-inserted");
                await page.locator(".services-cards_item.ng-star-inserted").nth(2).click({ delay: helper.getRandomDelay() });
                await page.waitForSelector(".modal-service_selector.ng-star-inserted");

                if (copyServices.servicesAbordajePrioritario.servicesAbordajePrioritarioIda) {
                    await page.locator(".service_item_action.ng-star-inserted").nth(0).click({ delay: helper.getRandomDelay() });
                }
                if (copyServices.servicesAbordajePrioritario.servicesAbordajePrioritarioVuelta) {
                    await page.locator(".service_item_action.ng-star-inserted").nth(1).click({ delay: helper.getRandomDelay() });
                }

                await helper.takeScreenshot("Abordaje prioritario añadido");
                await page.locator(".amount-summary_button.amount-summary_button--action.ds-button.ng-star-inserted").click({ delay: helper.getRandomDelay() });
            } catch (error) {
                console.error("SERVICESPAGE => Error al seleccionar Abordaje prioritario | Error: ", error);
                throw error;
            }
        }
    },
    async selectBusinessLounge(): Promise<void> {
        if (copyServices.servicesAviancaLounges) {

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
        }
    },

    async selectSpecialAssistance(): Promise<void> {
        if (copyServices.servicesAsistenciaEspecial) {

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
        }
    },

    async selectTravelAssistance(): Promise<void> {
        if (copyServices.servicesAsistenciaViaje) {
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
        await this.selectExtraLuggage();
        await this.selectSportsEquipment();
        await this.selectPriorityApproach();
        await this.selectBusinessLounge();
        await this.selectSpecialAssistance();
        await this.selectTravelAssistance();
        await this.confirmServices();
        console.log("Services page ended...");
    }
};

export { ServicesPage };
