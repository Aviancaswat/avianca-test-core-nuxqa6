import { test, type Page } from '@playwright/test';
test.describe.configure({ mode: 'parallel' });
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

// Pendiente por desarrollar

/* Control granular de finalización de prueba: 
  agregar la capacidad de detener la ejecución en puntos más específicos del flujo, 
  por ejemplo en la selección de vuelo de ida dentro del flujo de Booking.*/

/* Gestión avanzada de capturas de pantalla: actualmente solo se guarda 
la captura final (test-finished) en las carpetas en local. 
Se debe implementar que todas las capturas de cada paso de la prueba se almacenen 
de forma ordenada en carpetas por prueba. */

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
    });

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
