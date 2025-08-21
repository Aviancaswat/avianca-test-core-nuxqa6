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
//     console.log('Deteniendo ejecución en el método someBookingMethod');
//     await bookingPage.someBookingMethod();
//     return;  // Detén la ejecución en ese método
//   }
//   await bookingPage.otherBookingMethod();  // Continuar con otro método si no es el de detener
// }