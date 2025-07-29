
export interface IBookingCopy {
    bookingEditFlightSelected: boolean,
    bookingNumeroVueloIda: string,
    bookingNumeroVueloRegreso: string,
    bookingConsultaCondicionesTarifa: boolean
    booking: {
        es: {
            bookingInformacionTarifa: string,
        },
        en: {
            bookingInformacionTarifa: string,
        },
        pt: {
            bookingInformacionTarifa: string,
        },
        fr: {
            bookingInformacionTarifa: string,
        }
    }
    bookingTarifaIda: "light" | "basic" | "classic" | "flex" | "business" | "insignia",
    bookingTarifaVuelta: "light" | "basic" | "classic" | "flex" | "business" | "insignia",
    bookingConsultaRetractoDesistimiento: boolean;
}

export const copyBooking: IBookingCopy = {
    bookingEditFlightSelected: true,
    bookingNumeroVueloIda: '0',
    bookingNumeroVueloRegreso: '0',
    bookingConsultaCondicionesTarifa: false,
    booking: {
        es: {
            bookingInformacionTarifa: 'condiciones de tu tarifa',
        },
        en: {
            bookingInformacionTarifa: 'conditions of your fare',
        },
        pt: {
            bookingInformacionTarifa: 'condições da sua tarifa',
        },
        fr: {
            bookingInformacionTarifa: 'conditions de votre tarif',
        }
    },
    bookingTarifaIda: "classic",
    bookingTarifaVuelta: "basic",
    bookingConsultaRetractoDesistimiento: false
}