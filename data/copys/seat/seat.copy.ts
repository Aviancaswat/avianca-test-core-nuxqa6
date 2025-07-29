export interface ISeatCopy {
    seatTarifaDeAsientos: string,
    seatCambiarAsientosSeleccionados: boolean,
    seatSeleccionarAsientosPorDefecto: boolean,
    seatVolverAModuloServicios: boolean,
    seatContinuarAlSiguienteVuelo: boolean,
    es: {
        seatPagar: string,
    },
    en: {
        seatPagar: string,
    },
    pt: {
        seatPagar: string,
    },
    fr: {
        seatPagar: string,
    }
}

export const copySeat: ISeatCopy = {
    seatTarifaDeAsientos: 'economy',
    seatCambiarAsientosSeleccionados: false,
    seatSeleccionarAsientosPorDefecto: false,
    seatVolverAModuloServicios: false,
    seatContinuarAlSiguienteVuelo: false,
    es: {
        seatPagar: 'Ir a pagar',
    },
    en: {
        seatPagar: 'Go to payment',
    },
    pt: {
        seatPagar: 'Vá pagar',
    },
    fr: {
        seatPagar: 'Continuer',
    },

}