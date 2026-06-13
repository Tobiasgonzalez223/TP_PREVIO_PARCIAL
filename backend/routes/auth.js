import express from "express";
const router = express.Router();
import * as authController from "../controllers/authController.js";
import { validarRegistro, validarLogin } from "../middlewares/validationMiddleware.js";

// POST /api/auth/register — con validación de entrada
router.post("/register", validarRegistro, authController.register);

// POST /api/auth/login — con validación de entrada
router.post("/login", validarLogin, authController.login);

export default router;