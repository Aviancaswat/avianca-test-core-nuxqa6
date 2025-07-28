import { expect, type Page } from "@playwright/test";
import { GLOBAL_MESSAGES as m } from "../global.variables";
import { PlaywrightHelper as helper } from "../helpers/avianca.helper";
import { HomeCopy as copys } from "../data/copys/home/home.copy";

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

    /**
     * await page.getByRole('button', { name: '' }).nth(1).click();
            await page.getByRole('button', { name: '' }).nth(2).click();
            await page.getByRole('button', { name: '' }).nth(3).click();
            const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
            confirmar.click({ delay: helper.getRandomDelay() });
    */

    async selectPassengerAdult(numberPassenger: number): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (numberPassenger <= 0) {
            throw new Error("El número de pasajeros tiene que ser mayor a cero (0)");
        }

        try {

            const modalPassenger = await page.locator("#paxControlSearchId").isVisible();

            if (modalPassenger) { // Si el modal de pasajeros esta abierto.
                for (let i = 0; i < numberPassenger; i++) {
                    await page.getByRole('button', { name: '' }).nth(0).click();
                }
            }
            else { // si el modal de pasajeros esta cerrado.
                await page.locator('[aria-label="Pasajeros :1"]').click();
                await page.waitForTimeout(1000);
                for (let i = 0; i < numberPassenger; i++) {
                    await page.getByRole('button', { name: '' }).nth(0).click();
                }
            }

            await helper.takeScreenshot("seleccion-pasajeros-adultos");
        }
        catch (error) {
            throw new Error("HOMEPAGE => Ha ocurrido un error al seleccionar los pasajeros de adultos | Error: ", error);
        }
    },

    async selectPassengerYouths(numberPassenger: number): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (numberPassenger <= 0) {
            throw new Error("El número de pasajeros tiene que ser mayor a cero (0)");
        }

        try {

            const modalPassenger = await page.locator("#paxControlSearchId").isVisible();

            if (modalPassenger) { // Si el modal de pasajeros esta abierto.
                for (let i = 0; i < numberPassenger; i++) {
                    await page.getByRole('button', { name: '' }).nth(1).click();
                }
            }
            else { // si el modal de pasajeros esta cerrado.
                await page.locator('[aria-label="Pasajeros :1"]').click();
                await page.waitForTimeout(1000);
                for (let i = 0; i < numberPassenger; i++) {
                    await page.getByRole('button', { name: '' }).nth(1).click();
                }
            }

            await helper.takeScreenshot("seleccion-pasajeros-jovenes");
        }
        catch (error) {
            throw new Error("HOMEPAGE => Ha ocurrido un error al seleccionar los pasajeros de adultos | Error: ", error);
        }
    },

    async selectPassengerChildren(numberPassenger: number): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (numberPassenger <= 0) {
            throw new Error("El número de pasajeros tiene que ser mayor a cero (0)");
        }

        try {

            const modalPassenger = await page.locator("#paxControlSearchId").isVisible();

            if (modalPassenger) { // Si el modal de pasajeros esta abierto.
                for (let i = 0; i < numberPassenger; i++) {
                    await page.getByRole('button', { name: '' }).nth(2).click();
                }
            }
            else { // si el modal de pasajeros esta cerrado.
                await page.locator('[aria-label="Pasajeros :1"]').click();
                await page.waitForTimeout(1000);
                for (let i = 0; i < numberPassenger; i++) {
                    await page.getByRole('button', { name: '' }).nth(2).click();
                }
            }

            await helper.takeScreenshot("seleccion-pasajeros-niños");
        }
        catch (error) {
            throw new Error("HOMEPAGE => Ha ocurrido un error al seleccionar los pasajeros de adultos | Error: ", error);
        }
    },

    //el número de bebes que se pueden seleccionar depende del número de adultos seleccionados
    async selectPassengerInfant(numberPassenger: number): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        if (numberPassenger <= 0) {
            throw new Error("El número de pasajeros tiene que ser mayor a cero (0)");
        }

        try {

            const modalPassenger = await page.locator("#paxControlSearchId").isVisible();

            if (modalPassenger) { // Si el modal de pasajeros esta abierto.
                for (let i = 0; i < numberPassenger; i++) {
                    await page.getByRole('button', { name: '' }).nth(3).click();
                }
            }
            else { // si el modal de pasajeros esta cerrado.
                await page.locator('[aria-label="Pasajeros :1"]').click();
                await page.waitForTimeout(1000);
                for (let i = 0; i < numberPassenger; i++) {
                    await page.getByRole('button', { name: '' }).nth(3).click();
                }
            }

            await helper.takeScreenshot("seleccion-pasajeros-infantes");
        }
        catch (error) {
            throw new Error("HOMEPAGE => Ha ocurrido un error al seleccionar los pasajeros de adultos | Error: ", error);
        }
    },

    async confirmPassengerSelecteds(): Promise<void> {
        await page.waitForTimeout(500);
        const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
        await confirmar.click({ delay: helper.getRandomDelay() });
    },

    async selectOptionTypeFlight(): Promise<void> {

        await page.waitForSelector("#searchComponentDiv");

        if (copys.isActiveOptionOutbound) { //si esta seleccionado el vuelo de ida
            const checkIda = page.locator("#journeytypeId_1");
            await checkIda.click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("check-vuelo-ida");
        }
        else {
            const checkIdaVuelta = page.locator("#journeytypeId_0");
            await checkIdaVuelta.click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("check-vuelo-ida-vuelta");
        }

        await page.waitForTimeout(2000);
    },

    async verifyCookies(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            const consentBtn = await page.locator('#onetrust-pc-btn-handler', { delay: helper.getRandomDelay() });
            const isVisible = consentBtn.isVisible();

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
            const origen = page.getByPlaceholder((copys[lang])?.origen);
            await origen.fill(copys['ciudad_origen'], { delay: helper.getRandomDelay() });
            await origen.press('Enter');
            await page.waitForTimeout(1500);
            await (page.locator('id=' + copys['ciudad_origen'])).click({ delay: helper.getRandomDelay() })
            await helper.takeScreenshot('ciudad-origen');
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

        try {

            const lang = helper.getLang();
            await expect(page.getByPlaceholder(copys[lang]?.destino)).toBeVisible();
            const destino = page.getByPlaceholder(copys[lang]?.destino);
            await destino.click({ delay: helper.getRandomDelay() });
            await destino.fill(copys['ciudad_destino'], { delay: helper.getRandomDelay() });
            await destino.press('Enter');
            await (page.locator('id=' + copys['ciudad_destino'])).click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot('04-ciudad-destino');
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
            await page.locator('span').filter({ hasText: copys['fecha_salida'] }).click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot('seleccion-fecha-ida');
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

        try {

            await page.waitForTimeout(3000);
            await page.locator('span').filter({ hasText: copys['fecha_llegada'] }).click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot('seleccion-fecha-vuelta');
        }
        catch (error) {
            console.error("Home => Ocurrió un error al seleccionar la fecha de regreso, Error: ", error);
            throw error;
        }
    },

    async selectPassengers(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {
            await page.getByRole('button', { name: '' }).nth(1).click();
            await page.getByRole('button', { name: '' }).nth(2).click();
            await page.getByRole('button', { name: '' }).nth(3).click();
            const confirmar = await page.locator('div#paxControlSearchId > div > div:nth-of-type(2) > div > div > button')
            confirmar.click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot('seleccion-pasajeros');
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
            await expect(page.getByRole('button', { name: copys[lang]?.buscar, exact: true })).toBeVisible();
            await page.getByRole('button', { name: copys[lang]?.buscar, exact: true }).click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot('busqueda-vuelos');
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