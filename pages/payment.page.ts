import { expect, type Page } from "@playwright/test";
import { PlaywrightHelper as helper } from "../helpers/avianca.helper";

type TPage = Page | undefined | any;

export type TPaymentPage = {
  initPage(page: TPage): void;
  fillBillingDetails(): Promise<void>;
  run(): Promise<void>;
};

let page: TPage;

const PaymentPage: TPaymentPage = {
  initPage(pageP: TPage): void {
    page = pageP;
  },

  async fillBillingDetails(): Promise<void> {
    if (!page) throw new Error("PaymentPage => Page no ha sido inicializado");

    try {
      await page.waitForSelector("input#email", { timeout: 120_000 });

      // Email
      const emailInput = page.locator("input#email");
      await expect(emailInput).toBeVisible();
      await emailInput.fill("monitoreo.digital@avianca.com");

      // Dirección
      const addressInput = page.locator("input#address");
      await expect(addressInput).toBeVisible();
      await addressInput.fill("Calle 123 #45-67");

      // Ciudad
      const cityInput = page.locator("input#city");
      await expect(cityInput).toBeVisible();
      await cityInput.fill("Bogotá");

      // País
      const countryBtn = page.locator("button#country");
      await expect(countryBtn).toBeVisible();
      await countryBtn.click();

      await page.waitForSelector("div.ds-select-dropdown li button", { timeout: 5000 });

      const countryOption = page
        .locator("div.ds-select-dropdown li button")
        .filter({ hasText: "Colombia" });
      await expect(countryOption).toBeVisible();
      await countryOption.click({ delay: helper.getRandomDelay() });

      await helper.takeScreenshot("19-country-seleccionado");

      // Términos
      const termsCheckbox = page.locator("input#terms");
      await expect(termsCheckbox).toBeVisible();
      await termsCheckbox.check();

      await helper.takeScreenshot("20-aceptar-terminos");
      await helper.takeScreenshot("21-datos-facturacion");
    } catch (error) {
      console.error("PAYMENTPAGE => Error al llenar datos de facturación | Error:", error);
      throw error;
    }
  },

  async run(): Promise<void> {
    console.log("Payment page started...");
    await this.fillBillingDetails();
    console.log("Payment page ended...");
  },
};

export { PaymentPage };
