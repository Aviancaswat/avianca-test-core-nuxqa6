import { expect, type Page } from "@playwright/test";
import { copyPaseenger } from "../data/copys/passenger/passenger.copy";
import { GLOBAL_MESSAGES as m } from "../global.variables";
import { PlaywrightHelper as helper } from "../helpers/avianca.helper";
import { emailsData, lastNamesData, phoneNumbersData, userNamesData } from "../utils/variables";

type TPage = Page | undefined;

let page: TPage;

export type TPassengerPage = {
    initPage(page: Page): void;
    fillFormValues(): Promise<void>;
    continueToServices(): Promise<void>;
    run(): Promise<void>;
    saveInformationFuturePayments(): Promise<void>;
    fillFieldsForPosition(position: number): Promise<void>;
    confirmAuthorizeDataProcessing(): Promise<void>;
    acceptPersonalDataUsageForOffers(): Promise<void>;
    fillformMainPassenger(): Promise<void>;
    addProgramFlyerFrequentByPosition(position: number): Promise<void>;
    addProgramFlyerFrequentAll(): Promise<void>;
}

const PassengerPage: TPassengerPage = {

    initPage(pageP: TPage): void {
        page = pageP;
    },

    async fillFormValues(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            const formPassenger = helper.getTotalPassengers();
            const descriptionScreenshot = `
                Passenger | llenado de pasajeros
                Total formularios de pasajeros  ${formPassenger}
            `;
            await page.waitForSelector(".passenger_data_group");
            await helper.takeScreenshot("inicio-llenado-form-pasajeros", descriptionScreenshot);
            await page.evaluate(({ userNamesData, lastNamesData, emailsData, phoneNumbersData }) => {
                const getDataRandom = (data: Array<string> = []): string => {
                    return data[Math.floor(Math.random() * data.length)];
                }

                const getValueElement = (element: HTMLInputElement): string => {
                    let value: string | null = null;
                    if ((element.name === "email" || element.id === "email") ||
                        (element.name === "confirmEmail" || element.id === "confirmEmail")) {
                        value = getDataRandom(emailsData);
                    }
                    else if (element.name === "phone_phoneNumberId" || element.id === "phone_phoneNumberId") {
                        value = getDataRandom(phoneNumbersData);
                    }
                    else if (element.id.includes("IdFirstName")) {
                        value = getDataRandom(userNamesData);
                    }
                    else {
                        value = getDataRandom(lastNamesData);
                    }
                    return value;
                }

                const getButtonAndClickItem = () => {
                    const listOptions = document.querySelector(".ui-dropdown_list");
                    const buttonElement = listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement;
                    if (buttonElement) buttonElement.click();
                }

                const setValuesDefaultAutoForm = async () => {
                    const elements = document.querySelectorAll('.ui-input');
                    Array.from(elements).forEach((element) => {
                        if (element.tagName === "BUTTON") {
                            const elementButton = element as HTMLButtonElement;
                            elementButton.click();
                            const listOptions = document.querySelector(".ui-dropdown_list");
                            (listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement)?.click();
                            setTimeout(() => {
                                elementButton.click();
                                getButtonAndClickItem();
                            }, 1000);
                        }
                        else if (element.tagName === "INPUT") {
                            const elementInput = element as HTMLInputElement;
                            const containers = document.querySelectorAll(".ui-input-container");
                            Array.from(containers).forEach(e => { e.classList.add("is-focused") });
                            let eventBlur: Event = new Event("blur");
                            let eventFocus: Event = new Event("focus");
                            elementInput.value = getValueElement(elementInput);
                            ['change', 'input'].forEach(event => {
                                let handleEvent = new Event(event, { bubbles: true, cancelable: false });
                                element.dispatchEvent(handleEvent);
                            });

                            element.dispatchEvent(eventFocus);
                            setTimeout(() => {
                                element.dispatchEvent(eventBlur);
                                Array.from(containers).forEach(e => { e.classList.remove("is-focused") });
                            }, 1000);
                        }
                    });

                    if (page) {
                        await page.waitForSelector("id=acceptNewCheckbox");
                        await expect(page.locator('id=acceptNewCheckbox')).toBeVisible();
                        await (page.locator('id=acceptNewCheckbox')).click();
                    }
                }
                setValuesDefaultAutoForm();
            }, { userNamesData, lastNamesData, emailsData, phoneNumbersData });

            await helper.takeScreenshot("fin-llenado-form-pasajeros", descriptionScreenshot);
        }
        catch (error) {
            console.error("PASSENGER => Ocurrió un error al generar los datos aleatorios en formulario de pasajeros. Error: ", error);
            throw error;
        }
    },

    async continueToServices(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            await page.waitForTimeout(2000);
            await expect(page.locator(".button.page_button.btn-action").last()).toBeVisible();
            await page.locator(".button.page_button.btn-action").last().click({ delay: helper.getRandomDelay() });
            await page.waitForSelector(".main-banner--section-offer", { timeout: 100_000 });
        }
        catch (error) {
            console.error("PASSENGER => Ocurrió un error al click en continuar en servicios. Error: ", error);
            throw error;
        }
    },

    async saveInformationFuturePayments(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            const descriptionScreenshot = `
            Passenger | guardar informacion para futuras compras
            `

            await page.waitForSelector(".passenger_data");
            const elementSaveInformation = page.locator("label[for='guardar-informacion']");
            expect(elementSaveInformation).toBeVisible({ timeout: 30000 });
            await elementSaveInformation.click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("check-guardar-informacion-futuras-compras", descriptionScreenshot);
            await page.waitForTimeout(2000);
        }
        catch (error) {
            console.error("PASSENGER => Ha ocurrido un error: click en guardar información para futuras compras | Error: ", error);
            throw error;
        }
    },

    async fillFieldsForPosition(positionPassenger: number): Promise<void> {
        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            await page.waitForSelector(".passenger_data");

            //validando que la posición exista en el DOM
            const passengers = await (page as Page).locator(".passenger_data_group_item").all();
            const countPassengers = passengers.length;
            const isValidPosition = (positionPassenger > 0) && (positionPassenger <= countPassengers);

            if (!isValidPosition) {
                throw new Error("El pasajero con la pocisión solicitada no existe. Escoje una posición válida");
            }

            await (page as Page).evaluate(({ positionPassenger, emailsData, phoneNumbersData, userNamesData, lastNamesData }) => {
                //funciones
                const getDataRandom = (data: Array<string> = []): string => {
                    return data[Math.floor(Math.random() * data.length)];
                }

                const getValueElement = (element: HTMLInputElement): string => {
                    let value: string | null = null;
                    if (element.name === "email" || element.name === "confirmEmail") {
                        value = getDataRandom(emailsData);
                    }
                    else if (element.name === "phone_phoneNumberId") {
                        value = getDataRandom(phoneNumbersData);
                    }
                    else if (element.id.includes("IdFirstName")) {
                        value = getDataRandom(userNamesData);
                    }
                    else {
                        value = getDataRandom(lastNamesData);
                    }
                    return value;
                }

                const getButtonAndClickItem = () => {
                    const listOptions = document.querySelector(".ui-dropdown_list");
                    const buttonElement = listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement;
                    buttonElement.click();
                }

                // variables
                const passenger = document.querySelectorAll(".passenger_data_group_item");
                const arrayPassenger = Array.from(passenger);
                const passengerToFill = arrayPassenger[positionPassenger - 1];
                const elements = passengerToFill.querySelectorAll(".ui-input");

                Array.from(elements).forEach((element) => {

                    if (element.tagName === "BUTTON") {
                        const elementButton = element as HTMLButtonElement;
                        elementButton.click();
                        const listOptions = passengerToFill.querySelector(".ui-dropdown_list");
                        (listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement)?.click();

                        if (element.id === "passengerId") {
                            elementButton.click();
                            setTimeout(() => {
                                getButtonAndClickItem();
                            }, 1000);
                        }
                        else if (element.id === 'phone_prefixPhoneId') {
                            setTimeout(() => {
                                elementButton.click();
                                getButtonAndClickItem();
                            }, 1000);
                        }
                    }
                    else if (element.tagName === "INPUT") {
                        const elementInput = element as HTMLInputElement;
                        const containers = passengerToFill.querySelectorAll(".ui-input-container");
                        Array.from(containers).forEach(e => { e.classList.add("is-focused") });
                        let eventBlur: Event = new Event("blur");
                        let eventFocus: Event = new Event("focus");
                        elementInput.value = getValueElement(elementInput);
                        ['change', 'input'].forEach(event => {
                            let handleEvent = new Event(event, { bubbles: true, cancelable: false });
                            element.dispatchEvent(handleEvent);
                        });

                        element.dispatchEvent(eventFocus);
                        setTimeout(() => {
                            element.dispatchEvent(eventBlur);
                            Array.from(containers).forEach(e => { e.classList.remove("is-focused") });
                        }, 1000);
                    }
                });
            }, { positionPassenger, emailsData, phoneNumbersData, userNamesData, lastNamesData });
             const descriptionScreenshot = `
            Passenger | llenar formulario de pasajero por posición
            Posicion del pasajero ${positionPassenger}
            `
            await helper.takeScreenshot(`llenado-formulario-pasajero-#${positionPassenger}` , descriptionScreenshot);
            await page.waitForTimeout(1000);
        }
        catch (error) {
            console.error("PASSENGER => Ha ocurrido un error al llenar los campos de los pasajeros por posición | Error: ", error);
            throw error;
        }
    },

    /** Sirve para confirmar la autorización el tratamiento de datos en el formulario de pasajeros */
    async confirmAuthorizeDataProcessing(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {
            const descriptionPassenger = `Passenger | confirmacion de autorización para el tratamiento de datos`
            await page.waitForSelector(".passenger_data");
            await page.evaluate(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) });
            const checkAuthorizeData = page.locator("label[for='acceptNewCheckbox']");
            await expect(checkAuthorizeData).toBeVisible({ timeout: 15000 });
            await checkAuthorizeData.click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("confirmacion-autorizacion-tratamiento-datos", descriptionPassenger);
            await page.waitForTimeout(1000);

        } catch (error) {
            console.error("PASSENGERPAGE => Ha ocurrido un error al confirmar la autorización de tratamiento de datos | Error: ", error);
            throw error;
        }
    },

    /** Sirve para aceptar el uso de datos personales para envio de promiciones y ofertas */
    async acceptPersonalDataUsageForOffers(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            const descriptionScreenshot = "Passenger | Aceptación del uso de datos personales"
            await page.waitForSelector(".passenger_data");
            await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
            const checkAcceptUseDataOffers = page.locator("label[for='sendNewsLetter']");
            await expect(checkAcceptUseDataOffers).toBeVisible({ timeout: 15000 });
            await checkAcceptUseDataOffers.click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("aceptar-uso-datos-promociones", descriptionScreenshot);
            await page.waitForTimeout(1000);

        } catch (error) {
            console.error("PASSENGERPAGE => Ha ocurrido un error al confirmar el uso de datos personales para promociones | Error: ", error);
            throw error;
        }
    },

    /** Sirve para llenar los campos del formulario de titular de la reserva */
    async fillformMainPassenger(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            const descriptionScreenshot = "Passenger | llenar formulario del titular de la reserva";
            await page.waitForSelector(".passenger_data");
            await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
            await this.fillFieldsForPosition(1);
            await page.evaluate(({ emailsData, phoneNumbersData, userNamesData, lastNamesData }) => {
                const getDataRandom = (data: Array<string> = []): string => {
                    return data[Math.floor(Math.random() * data.length)];
                }
                const getValueElement = (element: HTMLInputElement): string => {
                    let value: string | null = null;
                    if (element.name === "email" || element.name === "confirmEmail") {
                        value = getDataRandom(emailsData);
                    }
                    else if (element.name === "phone_phoneNumberId") {
                        value = getDataRandom(phoneNumbersData);
                    }
                    else if (element.id.includes("IdFirstName")) {
                        value = getDataRandom(userNamesData);
                    }
                    else {
                        value = getDataRandom(lastNamesData);
                    }
                    return value;
                }
                const getButtonAndClickItem = () => {
                    const listOptions = document.querySelector(".ui-dropdown_list");
                    const buttonElement = listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement;
                    buttonElement.click();
                }

                const containerMainPassenger = document.querySelector(".contact_data");
                if (!containerMainPassenger) throw new Error("No ha sido encontrado el titular de la reserva en el DOM");

                const elements = containerMainPassenger.querySelectorAll(".ui-input");

                Array.from(elements).forEach((element) => {

                    if (element.tagName === "BUTTON") {
                        const elementButton = element as HTMLButtonElement;
                        elementButton.click();
                        const listOptions = containerMainPassenger.querySelector(".ui-dropdown_list");
                        (listOptions?.querySelector(".ui-dropdown_item>button") as HTMLButtonElement)?.click();

                        if (element.id === "passengerId") {
                            elementButton.click();
                            setTimeout(() => {
                                getButtonAndClickItem();
                            }, 1000);
                        }
                        else if (element.id === 'phone_prefixPhoneId') {
                            setTimeout(() => {
                                elementButton.click();
                                getButtonAndClickItem();
                            }, 1000);
                        }
                    }
                    else if (element.tagName === "INPUT") {
                        const elementInput = element as HTMLInputElement;
                        const containers = containerMainPassenger.querySelectorAll(".ui-input-container");
                        Array.from(containers).forEach(e => { e.classList.add("is-focused") });
                        let eventBlur: Event = new Event("blur");
                        let eventFocus: Event = new Event("focus");
                        elementInput.value = getValueElement(elementInput);
                        ['change', 'input'].forEach(event => {
                            let handleEvent = new Event(event, { bubbles: true, cancelable: false });
                            element.dispatchEvent(handleEvent);
                        });

                        element.dispatchEvent(eventFocus);
                        setTimeout(() => {
                            element.dispatchEvent(eventBlur);
                            Array.from(containers).forEach(e => { e.classList.remove("is-focused") });
                        }, 1000);
                    }
                });
            }, { emailsData, phoneNumbersData, userNamesData, lastNamesData });
            await helper.takeScreenshot("llenado-campos-titular-reserva", descriptionScreenshot);
            await page.waitForTimeout(1000);
        } catch (error) {
            console.error("PASSENGERPAGE => Ha ocurrido un error al llenar los campos del pasajero titular del la reserva | Error: ", error);
            throw error;
        }
    },

    /** Sirve para agregar la opción del programa de viajero frecuente dada una posición */
    async addProgramFlyerFrequentByPosition(positionPassenger: number): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            await page.waitForSelector(".passenger_data");
            const passengers = await page.locator(".passenger_data_group_item").all();
            const countPassengers = passengers.length;
            const isValidPosition = (positionPassenger > 0) && (positionPassenger <= countPassengers);

            if (!isValidPosition) {
                throw new Error("El pasajero con la pocisión solicitada no existe. Escoje una posición válida");
            }

            const arrayPassengers = Array.from(passengers);
            const indexPassenger = positionPassenger - 1;
            const passengerToAddedProgram = arrayPassengers[indexPassenger];

            //encontrando en boton de agregar programa de viajero frecuente
            const buttonAddProgram = await passengerToAddedProgram.locator(".FB946-add-program-btn");
            await expect(buttonAddProgram).toBeVisible({ timeout: 15000 });
            await buttonAddProgram.click({ delay: helper.getRandomDelay() });

            //esperamos que salga el dropdown del pasajero seleccionado por la posición
            const optionsProgramFlyer = page.locator(`#customerPrograms${indexPassenger}`);
            await expect(optionsProgramFlyer).toBeVisible({ timeout: 15000 });
            await optionsProgramFlyer.click({ delay: helper.getRandomDelay() });

            //espera para que salga la lista de opciones
            const listOptions = await page.locator("#listId_customerPrograms");
            await expect(listOptions).toBeVisible({ timeout: 15000 });
            const childrenList = await listOptions.locator("li").all();
            const countChildren = childrenList.length;
            const optionUser = copyPaseenger.passengeroOptionProgramFlyerFrequent;

            if (optionUser < 0) {
                throw new Error("La opción escogida por el usuario para el programa de viajero frecuente no es válida");
            }

            if (countChildren < 0) {
                throw new Error("No hay Opciones disponibles en el programa de viajero frecuente");
            }

            let positionChildrenToSelected = optionUser === 0 ? Math.floor(Math.random() * countChildren) : optionUser;
            const childrenToSelected = childrenList[positionChildrenToSelected];
            await childrenToSelected.click({ delay: helper.getRandomDelay() });
            await helper.takeScreenshot("seleccion-programa-viajero-frecuente-agregado");

            // Nota: si escoge la opcion de No Aplica (#1) no se agrega el número del viajero
            // (el input de viajero frecuente no aparece)
            if (optionUser !== 1) {
                // esperamos que salga el nuevo input para número de viajero
                await page.waitForTimeout(1500);
                const inputsUI = await passengerToAddedProgram.locator("input.ui-input").all();
                const inputsLenght = inputsUI.length;
                const inputToFillNumberFlyer = inputsUI[inputsLenght - 1];
                await inputToFillNumberFlyer.click({ delay: helper.getRandomDelay() });
                await inputToFillNumberFlyer.fill("123456");
                const descriptionScreenshot = `Passenger | agregar programa de viajero frecuente 
                Posicion de pasajero agregado: ${positionPassenger}
                `
                await helper.takeScreenshot("llenado-numero-viajero-frecuente", descriptionScreenshot);
            }
            await page.waitForTimeout(1000);
        } catch (error) {
            console.error(`PASSENGERPAGE => Ha ocurrido un error al agregar el programa de viajero frecuente en la posición ${positionPassenger} | Error: , ${error}`);
            throw error;
        }
    },

    async addProgramFlyerFrequentAll(): Promise<void> {

        if (!page) {
            throw new Error(m.errors.initializated);
        }

        try {

            await page.waitForSelector(".passenger_data");
            const passengerList = await page.locator(".passenger_data_group_item").all();
            const passengerSize = passengerList.length;

            for (let i = 1; i <= passengerSize; i++) {
                const indexP = i - 1;
                const passengerItem = passengerList[indexP];
                const programFlyr = await passengerItem.locator(".FB946-add-program-btn");
                const isContainProgramFlyr = await programFlyr.isVisible();
                if (!isContainProgramFlyr) {
                    console.log(`El pasajero con la posición ${i} no tiene el programa de viajero frecuente`);
                    continue;
                }
                await this.addProgramFlyerFrequentByPosition(i);
            }
        } catch (error) {
            console.error("PASSENGERPAGE => Ha ocurrido un error al agregar el programa de viajeros frecuentes para todos los pasajeros | Error: ", error);
            throw error;
        }
    },

    async run(): Promise<void> {
        console.log("Passenger page started...");
        await this.fillFormValues();
        await this.continueToServices();
        console.log("Passenger page ended...");
    },
}

export { PassengerPage };

