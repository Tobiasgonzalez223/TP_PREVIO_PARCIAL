import api from "./api.js"
import { setLoading } from "./loading"

const listar = async () => {
  setLoading(true)
  try {
    const response = await api.get("/activos")
    return response.data
  } finally {
    setLoading(false)
  }
}

export default { listar }
