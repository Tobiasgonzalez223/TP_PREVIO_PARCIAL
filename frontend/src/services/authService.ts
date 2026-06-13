import api from "./api"

type LoginPayload = {
    email: string
    password: string
}

type RegisterPayload = {
    nombre: string
    email: string
    password: string
}

const login = async (payload: LoginPayload) => {
    const response = await api.post("/auth/login", payload)
    const data = response.data
    if (data?.token) {
        sessionStorage.setItem("authToken", data.token)
        sessionStorage.setItem("authUser", JSON.stringify(data.usuario ?? null))
    }
    return data
}

const register = async (payload: RegisterPayload) => {
    const response = await api.post("/auth/register", payload)
    return response.data
}

const logout = () => {
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("authUser")
}

const getCurrentUser = () => {
    const raw = sessionStorage.getItem("authUser")
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
