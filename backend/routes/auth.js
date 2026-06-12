import express from "express";
const router = express.Router();
// Importamos el controlador de auth (vas a tener que crearlo en la carpeta controllers)
import * as authController from "../controllers/authController.js";

// POST /api/auth/register [cite: 97]
router.post('/register', authController.register);

// POST /api/auth/login [cite: 98]
router.post('/login', authController.login);

export default router;