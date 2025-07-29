import { BookingPage, HomePage, PassengerPage, PaymentPage, SeatPage, ServicesPage } from "../../pages";

const dataPages = {
    home: async () => await HomePage.run(),
    booking: async () => {
        await HomePage.run();
        await BookingPage.run();
    },
    passenger: async () => {
        await HomePage.run();
        await BookingPage.run();
        await PassengerPage.run();
    },
    services: async () => {
        await HomePage.run();
        await BookingPage.run();
        await PassengerPage.run();
        await ServicesPage.run();
    },
    seat: async () => {
        await HomePage.run();
        await BookingPage.run();
        await PassengerPage.run();
        await ServicesPage.run();
        await SeatPage.run();
    },
    payment: async () => {
        await HomePage.run();
        await BookingPage.run();
        await PassengerPage.run();
        await ServicesPage.run();
        await SeatPage.run();
        await PaymentPage.run();
    }
};

export { dataPages };

