import { test, type Page } from '@playwright/test';
import { AviancaCore } from "../core/avianca.core";
import { tests } from '../data/config/data';
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

test.describe(`Casos de pruebas de avianca`, () => {
  tests.forEach((itemTest, index) => {
    test.describe(`Test ${index + 1}: ${itemTest.description}`, () => {
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
        setDataTest({});
        page = undefined;
      });

      test(`${itemTest.description}`, async ({ }) => {
        await AviancaCore.initTests();
        await homePage.verifyCookies();
        await homePage.selectOriginOption();
        await homePage.selectReturnOption();
      });
    });
  });
});