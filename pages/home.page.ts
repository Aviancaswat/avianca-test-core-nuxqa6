import { expect, type Page } from "@playwright/test";
import { genericCopys as copys } from "../data/copys/index";
import { GLOBAL_MESSAGES as m } from "../global.variables";
import { PlaywrightHelper as helper } from "../helpers/avianca.helper";

type TPage = Page | undefined | any;

export type THomePage = {
    verifyCookies(): Promise<void>;
    selectOptionTypeFlight(): Promise<void>;
    selectOriginOption(): Promise<void>;
    selectReturnOption(): Promise<void>;
    selectDepartureDate(): Promise<void>;
    selectReturnDate(): Promise<void>;
    selectPassengers(): Promise<void>;
    searchFlights(): Promise<void>;
    initPage(page: TPage): void;
    run(): Promise<void>;
    selectPassengerAdult(passengerNumber: number): Promise<void>;
    selectPassengerYouths(passengerNumber: number): Promise<void>;
    selectPassengerChildren(passengerNumber: number): Promise<void>;
    selectPassengerInfant(passengerNumber: number): Promise<void>;
    confirmPassengerSelecteds(): Promise<void>;
}

let page: TPage;

const HomePage: THomePage = {
    initPage(pageP: TPage): void {
        page = pageP;
    },

    async selectPassengerAdult(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (copys.homePassengerAdults! <= 0) {
            throw new Error("El número de pasajeros tiene que ser mayor a cero (0)");
        }

        try {

            const modalPassenger = await page.locator("#paxControlSearchId").isVisible();

            if (modalPassenger) {
                for (let i = 0; i < copys.homePassengerAdults!; i++) {
                    await page.getByRole('button', { name: '' }).nth(0).click();
                }
            }
            else {
                await page.locator('[aria-label="Pasajeros :1"]').click();
                await page.waitForTimeout(1000);
                for (let i = 0; i < copys.homePassengerAdults!; i++) {
                    await page.getByRole('button', { name: '' }).nth(0).click();
                }
            }

            const descriptionScreenshot = `
                HOME | seleccion de pasajeros adultos
                Total adultos seleccionados: ${copys.homePassengerAdults}`;

            await helper.takeScreenshot("seleccion-pasajeros-adultos", descriptionScreenshot);
        }
        catch (error) {
            throw new Error(`HOMEPAGE => Ha ocurrido un error al seleccionar los pasajeros de adultos | Error: ${error}`);
        }
    },

    async selectPassengerYouths(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (copys.homePassengerYouths! <= 0) {
            throw new Error("El número de pasajeros tiene que ser mayor a cero (0)");
        }

        try {

            const modalPassenger = await page.locator("#paxControlSearchId").isVisible();

            if (modalPassenger) { // Si el modal de pasajeros esta abierto.
                for (let i = 0; i < copys.homePassengerYouths!; i++) {
                    await page.getByRole('button', { name: '' }).nth(1).click();
                }
            }
            else { // si el modal de pasajeros esta cerrado.
                await page.locator('[aria-label="Pasajeros :1"]').click();
                await page.waitForTimeout(1000);
                for (let i = 0; i < copys.homePassengerYouths!; i++) {
                    await page.getByRole('button', { name: '' }).nth(1).click();
                }
            }

            const descriptionScreenshot = `
                HOME | seleccion de pasajeros jóvenes
                Total jóvenes seleccionado: ${copys.homePassengerYouths}`;
            await helper.takeScreenshot("seleccion-pasajeros-jovenes", descriptionScreenshot);
        }
        catch (error) {
            throw new Error(`HOMEPAGE => Ha ocurrido un error al seleccionar los pasajeros de adultos | Error: ${error}`);
        }
    },

    async selectPassengerChildren(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (copys.homePassengerChildren! <= 0) {
            throw new Error("El número de pasajeros tiene que ser mayor a cero (0)");
        }

        try {

            const modalPassenger = await page.locator("#paxControlSearchId").isVisible();

            if (modalPassenger) { // Si el modal de pasajeros esta abierto.
                for (let i = 0; i < copys.homePassengerChildren!; i++) {
                    await page.getByRole('button', { name: '' }).nth(2).click();
                }
            }
            else { // si el modal de pasajeros esta cerrado.
                await page.locator('[aria-label="Pasajeros :1"]').click();
                await page.waitForTimeout(1000);
                for (let i = 0; i < copys.homePassengerChildren!; i++) {
                    await page.getByRole('button', { name: '' }).nth(2).click();
                }
            }

            const descriptionScreenshot = `
                Home | selección de pasajeros niños 
                Total de niños seleccionados: ${copys.homePassengerChildren}
                `
            await helper.takeScreenshot("seleccion-pasajeros-niños", descriptionScreenshot);
        }
        catch (error) {
            throw new Error(`HOMEPAGE => Ha ocurrido un error al seleccionar los pasajeros de adultos | Error: ${error}`);
        }
    },

    //el número de bebes que se pueden seleccionar depende del número de adultos seleccionados
    async selectPassengerInfant(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (copys.homePassengerInfant! <= 0) {
            throw new Error("El número de pasajeros tiene que ser mayor a cero (0)");
        }

        try {

            const modalPassenger = await page.locator("#paxControlSearchId").isVisible();

            if (modalPassenger) { // Si el modal de pasajeros esta abierto.
                for (let i = 0; i < copys.homePassengerInfant!; i++) {
                    await page.getByRole('button', { name: '' }).nth(3).click();
                }
            }
            else { // si el modal de pasajeros esta cerrado.
                await page.locator('[aria-label="Pasajeros :1"]').click();
                await page.waitForTimeout(1000);
                for (let i = 0; i < copys.homePassengerInfant!; i++) {
                    await page.getByRole('button', { name: '' }).nth(3).click();
                }
            }

            const descriptionScreenshot = `
                Home | selección de pasajeros infantes 
                Total de infantes seleccionados: ${copys.homePassengerInfant}
                `
            await helper.takeScreenshot("seleccion-pasajeros-infantes", descriptionScreenshot);
        }
        catch (error) {
            throw new Error(`HOMEPAGE => Ha ocurrido un error al seleccionar los pasajeros de adultos | Error: ${error}`);
        }
    },

    async confirmPassengerSelecteds(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        await page.waitForTimeout(500);
        const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
        await confirmar.click({ delay: helper.getRandomDelay() });
    },

    async selectOptionTypeFlight(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        await page.waitForSelector("#searchComponentDiv");
        let isTypeFlight = copys.homeisActiveOptionOutbound;

        if (isTypeFlight) { //si esta seleccionado el vuelo de ida
            const checkIda = page.locator("#journeytypeId_1");
            await checkIda.click({ delay: helper.getRandomDelay() });
        }
        else {
            const checkIdaVuelta = page.locator("#journeytypeId_0");
            await checkIdaVuelta.click({ delay: helper.getRandomDelay() });
        }

        const descriptionScreenshot = `
            Home | selección de tipo de vuelo 
           tipo de vuelo seleccionado: ${isTypeFlight ? "Solo ida" : "Ida y Vuelta"}
           `
        const messageScreenshot = isTypeFlight ? "check-vuelo-solo-ida" : "check-vuelo-ida-vuelta";
        await helper.takeScreenshot(messageScreenshot, descriptionScreenshot);
        await page.waitForTimeout(2000);
    },

    async verifyCookies(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            const consentBtn = await page.locator('#onetrust-pc-btn-handler', { delay: helper.getRandomDelay() });
            const isVisible = await consentBtn.isVisible();

            if (isVisible) {
                await page.waitForSelector("#onetrust-pc-btn-handler");
                await consentBtn.click();
                await page.locator('.save-preference-btn-handler.onetrust-close-btn-handler').click({ delay: helper.getRandomDelay() });
                await page.waitForTimeout(1000);
                await page.evaluate(() => window.scrollTo(0, 0));
            }
        }
        catch (error) {
            console.error("COOKIES => Ocurrió un error al verificar las cookies | Error: ", error);
            throw error;
        }
    },

    async selectOriginOption(): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            const lang = helper.getLang();
            const wrapperOrigin = page.locator('#originBtn');
            await expect(wrapperOrigin).toBeVisible({ timeout: 20_000 });
            await wrapperOrigin.click();
            const origen = page.getByPlaceholder((copys.home?.es.homeOrigen));
            await origen.fill(copys.homeCiudadOrigen, { delay: helper.getRandomDelay() });
            await origen.press('Enter');
            await page.waitForTimeout(1500);
            await (page.locator('id=' + copys.homeCiudadOrigen)).click({ delay: helper.getRandomDelay() })

            const descriptionScreenShot = `
                Home | selección de ciudad de origen 
                Ciudad origen seleccionada: ${copys.homeCiudadOrigen}
            `
            await helper.takeScreenshot('ciudad-origen', descriptionScreenShot);
            await page.waitForTimeout(2000);
        }
        catch (error) {
            console.error("HOME => Ocurrió un error al seleccionar la ciudad de origen ", error);
            throw error;
        }
    },

    async selectReturnOption(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if(copys.targetMethod === 'homeSeleccionarDestino'){
            console.log("Target method stop");
            // process.exit(0); 
            return;   
        }

        try {

            const lang = helper.getLang();
            await expect(page.getByPlaceholder(copys.home?.es.homeDestino)).toBeVisible();
            const destino = page.getByPlaceholder(copys.home?.es.homeDestino);
            await destino.click({ delay: helper.getRandomDelay() });
            await destino.fill(copys.homeCiudadDestino, { delay: helper.getRandomDelay() });
            await destino.press('Enter');
            await (page.locator('id=' + copys.homeCiudadDestino)).click({ delay: helper.getRandomDelay() });

            const descriptionScreenShot = `
                Home | selección de ciudad de destino 
                Ciudad destino seleccionada: ${copys.homeCiudadDestino}
            `
            await helper.takeScreenshot('04-ciudad-destino', descriptionScreenShot);
        }
        catch (error) {
            console.error("Home => Ocurrió un error al selecionar la ciudad de destino ", error);
            throw error;
        }
    },

    async selectDepartureDate(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            await page.waitForSelector("#departureInputDatePickerId");
            const fechaIda = await page.locator('id=departureInputDatePickerId');
            await fechaIda.click({ delay: helper.getRandomDelay() });
            await page.locator('span').filter({ hasText: copys.homeFechaSalida }).click({ delay: helper.getRandomDelay() });
            const descriptionScreenShot = `
                Home | selección de fecha de salida 
                Fecha de salidad seleccionada: ${copys.homeFechaSalida}
            `
            await helper.takeScreenshot('seleccion-fecha-ida', descriptionScreenShot);
        }
        catch (error) {
            console.error("Home => Ocurrió un error al seleccionar la fecha de ida, Error: ", error)
            throw error;
        }
    },

    async selectReturnDate(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (!copys.homeisActiveOptionOutbound) {

            try {

                await page.waitForTimeout(3000);
                await page.locator('span').filter({ hasText: copys.homeFechaLLegada }).click({ delay: helper.getRandomDelay() });
                const descriptionScreenShot = `
                    Home | selección de fecha de llegada 
                    Fecha de llegada seleccionada: ${copys.homeFechaLLegada}
                `
                await helper.takeScreenshot('seleccion-fecha-vuelta', descriptionScreenShot);
            }
            catch (error) {
                console.error("Home => Ocurrió un error al seleccionar la fecha de regreso, Error: ", error);
                throw error;
            }
        }
    },

    async selectPassengers(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            if (copys.homePassengerAdults! > 0) {
                for (let i = 0; i < copys.homePassengerAdults!; i++) {
                    await page.getByRole('button', { name: '' }).nth(0).click();
                }
            }

            if (copys.homePassengerYouths! > 0) {
                for (let i = 0; i < copys.homePassengerYouths!; i++) {
                    await page.getByRole('button', { name: '' }).nth(1).click();
                }
            }

            if (copys.homePassengerChildren! > 0) {
                for (let i = 0; i < copys.homePassengerChildren!; i++) {
                    await page.getByRole('button', { name: '' }).nth(2).click();
                }
            }

            if (copys.homePassengerInfant! > 0) {
                for (let i = 0; i < copys.homePassengerInfant!; i++) {
                    await page.getByRole('button', { name: '' }).nth(3).click();
                }
            }

            const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
            confirmar.click({ delay: helper.getRandomDelay() });
            const totalPassengers = (copys.homePassengerAdults! + 1) + copys.homePassengerYouths! + copys.homePassengerChildren! + copys.homePassengerInfant!;
            const descriptionScreenShot = `
                Home | selección de pasajeros 
                total pasajeros seleccionados: ${totalPassengers}
            `
            await helper.takeScreenshot('seleccion-pasajeros', descriptionScreenShot);
        }
        catch (error) {
            console.error("Home => Ocurrió un error al seleccionar los pasajeros, Error: ", error);
            throw error;
        }
    },

    async searchFlights(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            const lang = helper.getLang();
            await expect(page.getByRole('button', { name: copys.home![lang]?.homeBuscar, exact: true })).toBeVisible();
            await page.getByRole('button', { name: copys.home![lang]?.homeBuscar, exact: true }).click({ delay: helper.getRandomDelay() });
            
            const descriptionScreenShot = `
                Home | búsqueda de vuelos 
                Ciudades seleccionadas: ${copys.homeCiudadOrigen} - ${copys.homeCiudadDestino}
            `
            await helper.takeScreenshot('busqueda-vuelos', descriptionScreenShot);
            await page.waitForSelector('#pageWrap');
        }
        catch (error) {
            console.error("Home => Ocurrió un error al buscar los vuelos, Error: ", error);
            throw error;
        }
    },

    async run(): Promise<void> {
        console.log("Run Home ejecutado");
        await this.verifyCookies();
        await this.selectOptionTypeFlight();
        await this.selectOriginOption();
        await this.selectReturnOption();
        await this.selectDepartureDate();
        await this.selectReturnDate();
        await this.selectPassengers();
        await this.searchFlights();
        console.log("Run END ejecutado");
    }
};

export { HomePage };

