
interface BookingCopy {
    editFlightSelected: boolean,    
    numero_vuelo_ida: string,
    numero_vuelo_regreso: string,
    consulta_condiciones_tarifa:boolean,
    es: {
        informacion_tarifas: string,
    },
    en: {
        informacion_tarifas: string,
    },
    pt: {
        informacion_tarifas: string,
    },
    fr: {
        informacion_tarifas: string,
    },
    tarifa_ida: "light" | "basic" | "classic" | "flex" | "business" | "insignia",
    tarifa_vuelta: "light" | "basic" | "classic" | "flex" | "business" | "insignia",
    consulta_retracto_desistimiento: boolean,
}

export const copyBooking: BookingCopy = {
    editFlightSelected: true,
    numero_vuelo_ida:'0',
    numero_vuelo_regreso:'0',
    consulta_condiciones_tarifa:false,
    es: {
        informacion_tarifas: 'condiciones de tu tarifa',
    },
    en: {
        informacion_tarifas: 'conditions of your fare',
    },
    pt: {
        informacion_tarifas: 'condições da sua tarifa',
    },
    fr: {
        informacion_tarifas: 'conditions de votre tarif',
    },
    tarifa_ida:"classic",
    tarifa_vuelta:"basic",
    consulta_retracto_desistimiento: false,
}