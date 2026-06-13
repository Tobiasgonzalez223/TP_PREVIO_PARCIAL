import express from "express";
const router = express.Router();
import * as ordenesController from "../controllers/ordenesController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import {
  validarCrearOrden,
  validarEditarOrden,
  validarAsignar,
} from "../middlewares/validationMiddleware.js";

// Todas las rutas requieren JWT
router.use(verifyToken);

// GET /api/ordenes
router.get("/", ordenesController.listar);

// GET /api/ordenes/resumen — solo admin/mantenimiento
router.get("/resumen", verifyRole(["admin", "mantenimiento"]), ordenesController.obtenerResumen);

// GET /api/ordenes/:id
router.get("/:id", ordenesController.obtenerPorId);

// GET /api/ordenes/:id/historial
router.get("/:id/historial", ordenesController.obtenerHistorial);

// POST /api/ordenes — con validación de entrada
router.post(
  "/",
  verifyRole(["solicitante", "admin", "mantenimiento"]),
  validarCrearOrden,
  ordenesController.crear
);

// PUT /api/ordenes/:id — con validación de entrada
router.put(
  "/:id",
  verifyRole(["solicitante", "admin", "mantenimiento"]),
  validarEditarOrden,
  ordenesController.editar
);

// PATCH /api/ordenes/:id/cancelar
router.patch(
  "/:id/cancelar",
  verifyRole(["solicitante", "admin", "mantenimiento"]),
  ordenesController.cancelar
);

// PATCH /api/ordenes/:id/asignar — con validación de tecnicoId
router.patch(
  "/:id/asignar",
  verifyRole(["admin", "mantenimiento"]),
  validarAsignar,
  ordenesController.asignar
);

// PATCH /api/ordenes/:id/en_proceso
router.patch(
  "/:id/en_proceso",
  verifyRole(["tecnico"]),
  ordenesController.pasarAEnProceso
);

// PATCH /api/ordenes/:id/resolver
router.patch(
  "/:id/resolver",
  verifyRole(["tecnico"]),
  ordenesController.resolver
);

export default router;