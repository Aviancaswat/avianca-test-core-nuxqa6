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
    getLang: () => Lang;
}

const HomeCopy: IHomeCopy = {
    homeIdioma: 'es' as Lang,
    homePais: 'CO',
    homeFechaSalida: 'jul 28',
    homeFechaLLegada: 'jul 29',
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
        },
    },
    getLang: () => HomeCopy.homeIdioma,
    homeisActiveOptionOutbound: true,
}

export { HomeCopy };
