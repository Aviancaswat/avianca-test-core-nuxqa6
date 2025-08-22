type Lang = 'es' | 'en' | 'pt' | 'fr';

type Position =
    | "AR" // Argentina
    | "BR" // Brasil
    | "CO" // Colombia
    | "ES" // España
    | "MX" // México
    | "US" // Estados Unidos
    | "CA" // Canadá
    | "FR" // Francia
    | "IT" // Italia
    | "DE" // Alemania
    | "GB" // Reino Unido
    | "PT" // Portugal
    | "CL" // Chile
    | "PE" // Perú
    | "VE" // Venezuela
    | "JP" // Japón
    | "KR" // Corea del Sur
    | "AU" // Australia
    | "IN" // India
    | "RU"; // Rusia

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

type TpageAvianca =
    | 'home'
    | 'booking'
    | 'passenger'
    | 'services'
    | 'seat'
    | 'payment'

type TMethodAvianca =
    | 'homeSeleccionarOrigen'
    | 'homeSeleccionarDestino'
    | 'homeSeleccionarFechaSalida'
    | 'homeSeleccionarFechaLlegada'
    | 'homeSeleccionarPasajeros'
    | 'gotToBooking'


export type { copysType, Lang, Position, TMethodAvianca, TpageAvianca };

