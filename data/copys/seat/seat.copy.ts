interface SeatCopy {
    tarifaDeAsientos: string,
    cambiarAsientosSeleccionados: boolean,
    seleccionarAsientosPorDefecto:boolean,
    volverAModuloServicios:boolean,
    continuarAlSiguienteVuelo:boolean,
    es: {
        pagar: string,
    },
    en: {
        pagar: string,
    },
    pt: {
        pagar: string,
    },
    fr: {
        pagar: string,
    },
}

export const copySeat: SeatCopy = {
    tarifaDeAsientos: 'economy',
    cambiarAsientosSeleccionados: false,
    seleccionarAsientosPorDefecto:false,
    volverAModuloServicios:false,
    continuarAlSiguienteVuelo:false,
    es: {
        pagar: 'Ir a pagar',
    },
    en: {
        pagar: 'Go to payment',
    },
    pt: {
        pagar: 'Vá pagar',
    },
    fr: {
        pagar: 'Continuer',
    },
    
}