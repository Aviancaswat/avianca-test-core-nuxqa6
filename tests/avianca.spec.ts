import { test, type Page } from '@playwright/test';
import { AviancaCore } from "../core/avianca.core";
import { tests as data } from '../data/config/dataTests';
import { dataPages } from '../data/config/global.page';
import { setDataTest } from "../data/copys/index";
import { PlaywrightHelper as helper } from '../helpers/avianca.helper';
import {
  BookingPage,
  HomePage,
  PassengerPage,
  PaymentPage,
  SeatPage,
  ServicesPage,
  type TBookingPage,
  type THomePage,
  type TPassengerPage,
  type TPaymentPage,
  type TSeatPage,
  type TServicesPage,
} from "../pages/index";

data.forEach(itemTest => {
  test.describe(`${itemTest.id}`, () => {
    let page: Page | undefined | any;
    let homePage: THomePage = HomePage;
    let bookingPage: TBookingPage = BookingPage;
    let passengerPage: TPassengerPage = PassengerPage;
    let servicesPage: TServicesPage = ServicesPage;
    let seatPage: TSeatPage = SeatPage;
    let paymentPage: TPaymentPage = PaymentPage;

    test.beforeEach(async ({ }, testInfo) => {
      await AviancaCore.initializeBrowser();
      page = AviancaCore.getPage();

      if (page) {
        helper.init(page, testInfo);
        homePage.initPage(page);
        bookingPage.initPage(page);
        passengerPage.initPage(page);
        servicesPage.initPage(page);
        seatPage.initPage(page);
        paymentPage.initPage(page);
        setDataTest(itemTest);
      }
    });

    test.afterEach(async () => {
      await AviancaCore.closeBrowser();
      page = undefined;
      setDataTest({});

      console.log("Se finaliza la prueba");

    });

    test.afterAll(async () => {
      
      try {

        console.log("Esperando a actualizar el reporte");
        await helper.updateFileReport();
      }
      catch (error) {
        console.log("Ocurrio un error al actualizar el reporte: ", error);
      }
    })

    const { targetPage } = itemTest;
    const finalTargetPage = targetPage ?? "home";

    test(`${itemTest.description}`, async ({ }) => {
      await AviancaCore.initTests();
      const runPages = dataPages[finalTargetPage];

      if (runPages) {
        await runPages();
      } else {
        throw new Error(`No se encontró función de ejecución para la página "${finalTargetPage}"`);
      }
    });
  });
});