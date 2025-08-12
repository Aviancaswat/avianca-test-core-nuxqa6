import { TGenericCopys } from "../copys";

const tests: TGenericCopys[] = [
    {
        id: "ID PRUEBA - Test bogotá a medellín - ida y vuelta - agosto 28 a agosto 29",
        description: "ruta de barranquilla a bogotá",
        homeCiudadOrigen: "BOG",
        homeCiudadDestino: "MDE",
        targetPage: "home"
    },
    {
        id: "OTRO ID PRUEBA - selección de tarifa economy | Bogotá a barranquilla | agosto 28 a agosto 29 | solo ida",
        description: "ruta de barranquilla a bogotá",
        homeCiudadOrigen: "BOG",
        homeCiudadDestino: "BAQ",
        targetPage: "passenger",
    }
]

export { tests };

