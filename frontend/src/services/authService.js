import api from "./api.js"
import { setLoading } from "./loading"

const login = async (payload) => {
	setLoading(true)
	try {
		const response = await api.post("/auth/login", payload)
		const data = response.data
		if (data?.token) {
			localStorage.setItem("authToken", data.token)
			localStorage.setItem("authUser", JSON.stringify(data.usuario ?? null))
		}
		return data
	} finally {
		setLoading(false)
	}
}

const register = async (payload) => {
	setLoading(true)
	try {
		const response = await api.post("/auth/register", payload)
		return response.data
	} finally {
		setLoading(false)
	}
}

const logout = () => {
	localStorage.removeItem("authToken")
	localStorage.removeItem("authUser")
}

const getCurrentUser = () => {
	const raw = localStorage.getItem("authUser")
	if (!raw) return null
	try {
		return JSON.parse(raw)
	} catch {
		return null
	}
}

export default {
	login,
	register,
	logout,
	getCurrentUser,
}
