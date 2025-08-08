export interface IServicesCopy {
    servicesEquipajeManoBodega: false | IServicesEquipajeManoBodegaCopy,
    servicesEquipajeDeportivo: false | IServicesEquipajeEquipajeDeportivoCopy,
    servicesAbordajePrioritario: false | IServicesAbordajePrioritarioCopy,
    servicesAviancaLounges: false | IServicesAviancaLoungesCopy,
    servicesAsistenciaEspecial: false | IServicesAsistenciaEspecialCopy,
    servicesAsistenciaViaje: boolean,
}
interface IServicesEquipajeManoBodegaCopy {
    servicesEquipajeManoIda: boolean,
    servicesEquipajeManoVuelta: boolean,
    servicesEquipajeBodegaIda: boolean,
    servicesEquipajeBodegaVuelta: boolean,
}
interface IServicesEquipajeEquipajeDeportivoCopy {
    servicesDeportivoBicicletaIda: number,
    servicesDeportivoBicicletaVuelta: number,
    servicesDeportivoGolfIda: number,
    servicesDeportivoGolfVuelta: number,
    servicesDeportivoBuceoIda: number,
    servicesDeportivoBuceoVuelta: number,
    servicesDeportivoSurfIda: number,
    servicesDeportivoSurfVuelta: number,
    servicesDeportivoEsquiarIda: number,
    servicesDeportivoEsquiarVuelta: number,
}
interface IServicesAbordajePrioritarioCopy {
    servicesAbordajePrioritarioIda: boolean,
    servicesAbordajePrioritarioVuelta: boolean,
}
interface IServicesAviancaLoungesCopy {
    servicesLoungesPrioritarioIda: boolean,
    servicesLoungesPrioritarioVuelta: boolean,
}
interface IServicesAsistenciaEspecialCopy {
    servicesAsistenciaDiscapacidadVisualIda: boolean,
    servicesAsistenciaDiscapacidadVisualVuelta: boolean,
    servicesAsistenciaDiscapacidadAuditivaIda: boolean,
    servicesAsistenciaDiscapacidadAuditivaVuelta: boolean,
    servicesAsistenciaDiscapacidadIntelectualIda: boolean,
    servicesAsistenciaDiscapacidadIntelectualVuelta: boolean,
    servicesAsistenciaPerroServicioIda: boolean,
    servicesAsistenciaPerroServicioVuelta: boolean,
    servicesAsistenciaDiscapacidadFisicaIda: boolean,
    servicesAsistenciaDiscapacidadFisicaVuelta: boolean,
}


export const copyServices: IServicesCopy = {
    servicesEquipajeManoBodega: false,
    // servicesEquipajeManoBodega: { //o false si no se quiere usar
    //     servicesEquipajeManoIda: true,
    //     servicesEquipajeManoVuelta: true,
    //     servicesEquipajeBodegaIda: true,
    //     servicesEquipajeBodegaVuelta: true
    // },
    servicesEquipajeDeportivo: false,
    servicesAbordajePrioritario: false,
    servicesAviancaLounges: false,
    servicesAsistenciaEspecial: false,
    servicesAsistenciaViaje: false,
}