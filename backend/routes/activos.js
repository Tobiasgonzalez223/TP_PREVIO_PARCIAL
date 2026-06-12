import express from "express";
const router = express.Router();
import * as activosController from "../controllers/activosController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

// El listado de activos también debería estar protegido
router.get('/', verifyToken, activosController.listar);

export default router;