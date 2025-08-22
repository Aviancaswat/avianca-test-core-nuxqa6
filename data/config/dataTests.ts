import { TGenericCopys } from "../copys";

const tests: TGenericCopys[] = [
    {
        id: "ID PRUEBA2",
        description: "ruta de barranquilla a bogotá",
        homeCiudadOrigen: "BOG",
        homeCiudadDestino: "MDE",
        targetPage: 'booking',
        targetMethod: 'homeSeleccionarDestino'
    }
]

export { tests };

// if (targetPage === 'booking') {
//   const bookingPage = BookingPage;
//   if (targetMethod === 'someBookingMethod') {
//     await bookingPage.someBookingMethod();
//     return;
//   }
//   await bookingPage.otherBookingMethod();
// }