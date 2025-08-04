import { TGenericCopys } from "../copys";

interface ExtendsTestCases extends TGenericCopys {
    id: number,
    description: string,
    targetPage: 'home' | 'booking' | 'passenger' | 'services' | 'seat' | 'payment'
}

const tests: ExtendsTestCases[] = [
    {
        id: 1,
        description: "Home => Payment",
        homeCiudadOrigen: "MDE",
        homeCiudadDestino: "BOG",
        targetPage: "home"
    }
]

export { tests };

