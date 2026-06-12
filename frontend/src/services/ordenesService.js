import api from "./api.js"
import { setLoading } from "./loading"

const listar = async (query = {}) => {
	setLoading(true)
	try {
		const response = await api.get("/ordenes", { params: query })
		return response.data
	} finally {
		setLoading(false)
	}
}

const obtenerPorId = async (id) => {
	setLoading(true)
	try {
		const response = await api.get(`/ordenes/${id}`)
		return response.data
	} finally {
		setLoading(false)
	}
}

const obtenerHistorial = async (id) => {
	setLoading(true)
	try {
		const response = await api.get(`/ordenes/${id}/historial`)
		return response.data
	} finally {
		setLoading(false)
	}
}

const obtenerResumen = async () => {
	setLoading(true)
	try {
		const response = await api.get("/ordenes/resumen")
		return response.data
	} finally {
		setLoading(false)
	}
}

const crear = async (payload) => {
	setLoading(true)
	try {
		const response = await api.post("/ordenes", payload)
		return response.data
	} finally {
		setLoading(false)
	}
}

const asignar = async (id, tecnicoId) => {
	setLoading(true)
	try {
		const response = await api.patch(`/ordenes/${id}/asignar`, { tecnicoId })
		return response.data
	} finally {
		setLoading(false)
	}
}

const resolver = async (id) => {
	setLoading(true)
	try {
		const response = await api.patch(`/ordenes/${id}/resolver`)
		return response.data
	} finally {
		setLoading(false)
	}
}

const cancelar = async (id) => {
	setLoading(true)
	try {
		const response = await api.patch(`/ordenes/${id}/cancelar`)
		return response.data
	} finally {
		setLoading(false)
	}
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
}
