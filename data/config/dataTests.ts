import { TGenericCopys } from "../copys";

const tests: TGenericCopys[] = [
    {
        id: "Test buscar vuelos | Bogotá a medellín | agosto 28 a agosto 29 | solo ida",
        description: "ruta de barranquilla a bogotá",
        homeCiudadOrigen: "BOG",
        homeCiudadDestino: "MDE",
        homeisActiveOptionOutbound: true,
        homePassengerAdults: 4,
        targetPage: "home"
    }
    // {
    //     id: "Test selección de tarifa economy | Bogotá a barranquilla | agosto 28 a agosto 29 | solo ida",
    //     description: "ruta de barranquilla a bogotá",
    //     homeCiudadOrigen: "BOG",
    //     homeCiudadDestino: "BAQ",
    //     homeisActiveOptionOutbound: true,
    //     homePassengerAdults: 2,
    //     targetPage: "passenger",
    //     seatTarifaDeAsientos: "economy"
    // }
]

export { tests };

