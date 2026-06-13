import express from "express"
import { promises as fs } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { verifyToken } from "../middlewares/authMiddleware.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, "../models/db.json")

const router = express.Router()

// GET /api/usuarios - Obtener lista de usuarios
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const db = JSON.parse(await fs.readFile(dbPath, 'utf-8'))
    // Devolver usuarios sin contraseñas
    const usuarios = db.usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: u.activo
    }))
    res.json(usuarios)
  } catch (error) {
    next(error)
  }
})

export default router
