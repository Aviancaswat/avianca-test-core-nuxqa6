type Lang = 'es' | 'en' | 'pt' | 'fr';

type copysType = {
    idioma: Lang,
    pais: string,
    fecha_salida: string,
    fecha_llegada: string,
    ciudad_origen: string,
    ciudad_destino: string,
    es: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    en: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    pt: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    fr: {
        origen: string,
        destino: string,
        buscar: string,
        vuelta: string,
        pagar: string
    },
    getLang: () => Lang
}

type TScreenshotDetails = { title: string, details: string };

export type { copysType, Lang, TScreenshotDetails };
