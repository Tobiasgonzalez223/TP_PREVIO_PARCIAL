import api from "./api"

const listar = async () => {
    const response = await api.get("/activos")
    return response.data
}

export default {
    listar,
}
