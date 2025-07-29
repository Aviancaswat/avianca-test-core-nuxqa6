import { TGenericCopys } from "../copys";

interface ExtendsTestCases extends TGenericCopys {
    id: number,
    description: string
}

const tests: ExtendsTestCases[] = [
    {
        id: 1,
        description: "Vuelos de la ruta Bogotá a barranquilla",
        homeCiudadOrigen: "BOG",
        homeCiudadDestino: "BAQ",
    },
    {
        id: 2,
        description: "Vuelos de la ruta Barranquilla a bogotá",
        homeCiudadOrigen: "BAQ",
        homeCiudadDestino: "BOG",
    }
]

export { tests };

