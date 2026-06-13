import api from "./api"

type QueryParams = Record<string, string | number | boolean | undefined>

const listar = async (query: QueryParams = {}) => {
    const response = await api.get("/ordenes", { params: query })
    return response.data
}

const obtenerPorId = async (id: string) => {
    const response = await api.get(`/ordenes/${id}`)
    return response.data
}

const obtenerHistorial = async (id: string) => {
    const response = await api.get(`/ordenes/${id}/historial`)
    return response.data
}

const obtenerResumen = async () => {
    const response = await api.get("/ordenes/resumen")
    return response.data
}

const crear = async (payload: Record<string, unknown>) => {
    const response = await api.post("/ordenes", payload)
    return response.data
}

const asignar = async (id: string, tecnicoId: string) => {
    const response = await api.patch(`/ordenes/${id}/asignar`, { tecnicoId })
    return response.data
}

const resolver = async (id: string) => {
    const response = await api.patch(`/ordenes/${id}/resolver`)
    return response.data
}

const cancelar = async (id: string) => {
    const response = await api.patch(`/ordenes/${id}/cancelar`)
    return response.data
}

const enProceso = async (id: string) => {
    const response = await api.patch(`/ordenes/${id}/en_proceso`)
    return response.data
}

const editar = async (id: string, payload: Record<string, unknown>) => {
    const response = await api.put(`/ordenes/${id}`, payload)
    return response.data
}

export default {
    listar,
    obtenerPorId,
    obtenerHistorial,
    obtenerResumen,
    crear,
    asignar,
    resolver,
    cancelar,
    enProceso,
    editar,
}
