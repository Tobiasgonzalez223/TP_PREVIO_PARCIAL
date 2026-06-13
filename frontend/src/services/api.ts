import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("authToken")
    if (token) {
        const headers = axios.AxiosHeaders.from(config.headers ?? {})
        headers.set("Authorization", `Bearer ${token}`)
        config.headers = headers
    }
    return config
})

export default api
