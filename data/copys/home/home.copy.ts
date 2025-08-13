import type { Lang } from "../../../types/copy.type";

interface HomeTranslation {
    homeOrigen: string;
    homeDestino: string;
    homeBuscar: string;
    homeVuelta: string;
    homePagar: string;
}

export interface IHomeCopy {
    homeIdioma: Lang;
    homePais: string;
    homeFechaSalida: string;
    homeFechaLLegada: string;
    homeCiudadOrigen: string;
    homeCiudadDestino: string;
    home: {
        es: HomeTranslation;
        en: HomeTranslation;
        pt: HomeTranslation;
        fr: HomeTranslation;
    },
    homeisActiveOptionOutbound: boolean;
    homePassengerAdults: number;
    homePassengerYouths: number;
    homePassengerChildren: number;
    homePassengerInfant: number;
}

const HomeCopy: IHomeCopy = {
    homeIdioma: 'es' as Lang,
    homePais: 'CO',
    homeFechaSalida: 'ago 28',
    homeFechaLLegada: 'ago 29',
    homeCiudadOrigen: 'MDE',
    homeCiudadDestino: 'BOG',
    home: {
        es: {
            homeOrigen: 'Origen',
            homeDestino: 'Hacia',
            homeBuscar: 'Buscar',
            homeVuelta: 'Vuelta',
            homePagar: 'Ir a pagar',
        },
        en: {
            homeOrigen: 'Origin',
            homeDestino: 'Destination',
            homeBuscar: 'Search',
            homeVuelta: 'Return',
            homePagar: 'Go to payment',
        },
        pt: {
            homeOrigen: 'Origem',
            homeDestino: 'Destino',
            homeBuscar: 'Buscar voos',
            homeVuelta: 'Regresso',
            homePagar: 'Vá pagar',
        },
        fr: {
            homeOrigen: 'Origen',
            homeDestino: 'Destination',
            homeBuscar: 'Rechercher',
            homeVuelta: 'Retour',
            homePagar: ' Continuer',
        }
    },
    homeisActiveOptionOutbound: false,
    homePassengerAdults: 0,
    homePassengerYouths: 0,
    homePassengerChildren: 0,
    homePassengerInfant: 0
}

export { HomeCopy };

