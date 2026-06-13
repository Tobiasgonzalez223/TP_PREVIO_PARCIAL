import api from "./api"

const listar = async () => {
    const response = await api.get("/usuarios")
    return response.data
}

export default {
    listar,
}
