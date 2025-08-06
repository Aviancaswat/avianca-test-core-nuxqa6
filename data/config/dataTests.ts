import { TGenericCopys } from "../copys";

const tests: TGenericCopys[] = [
    {
        id: "miUnicoId",
        description: "ruta de barranquilla a bogotá",
        homeCiudadOrigen: "BAQ",
        homeCiudadDestino: "BOG",
        targetPage: "home"
    },
    {
        id: "otroUnicoId",
        description: "ruta de bogotá a barranquilla",
        homeCiudadOrigen: "BAQ",
        homeCiudadDestino: "BOG",
        targetPage: "home"
    },
    {
        id: "despuesOtroUnicoId",
        description: "ruta de bogotá a barranquilla",
        homeCiudadOrigen: "MDE",
        homeCiudadDestino: "BOG",
        targetPage: "booking"
    }
]

export { tests };

