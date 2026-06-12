const express = require('express');
const router = express.Router();
// Importamos el controlador de órdenes
const ordenesController = require('../controllers/ordenesController');
// Importamos los middlewares de seguridad que te pasé en el paso anterior
const { verifyToken } = require('../middlewares/authMiddleware');
const verifyRole = require('../middlewares/roleMiddleware');
const validarCampos = require('../middlewares/validationMiddleware');

// Middleware a nivel de router: TODAS las rutas de abajo requerirán un JWT válido 
router.use(verifyToken);

// GET /api/ordenes - Lista las órdenes (acepta query params para los filtros) [cite: 100]
router.get('/', ordenesController.listar);

// GET /api/ordenes/resumen - Protegida solo para roles administrativos [cite: 101, 191]
router.get('/resumen', verifyRole(['admin', 'mantenimiento']), ordenesController.obtenerResumen);

// GET /api/ordenes/:id - Detalle de una orden [cite: 102]
router.get('/:id', ordenesController.obtenerPorId);

// GET /api/ordenes/:id/historial - Ver historial de cambios [cite: 103]
router.get('/:id/historial', ordenesController.obtenerHistorial);

// POST /api/ordenes - Crear una orden (los técnicos normalmente no crean, pero solicitantes y admins sí) [cite: 104, 88, 90]
router.post('/', verifyRole(['solicitante', 'admin', 'mantenimiento']), ordenesController.crear);

// PUT /api/ordenes/:id - Edición completa de la orden [cite: 105]
router.put('/:id', verifyRole(['solicitante', 'admin', 'mantenimiento']), ordenesController.editar);

// PATCH /api/ordenes/:id/cancelar - Acción específica: Cancelar [cite: 106, 88, 90]
router.patch('/:id/cancelar', verifyRole(['solicitante', 'admin', 'mantenimiento']), ordenesController.cancelar);

// PATCH /api/ordenes/:id/asignar - Acción específica: Asignar técnico (solo para admin/mantenimiento) [cite: 107, 90]
router.patch('/:id/asignar', verifyRole(['admin', 'mantenimiento']), ordenesController.asignar);

// PATCH /api/ordenes/:id/resolver - Acción específica: Resolver orden (pensado para el técnico) [cite: 107, 89]
router.patch('/:id/resolver', verifyRole(['tecnico']), ordenesController.resolver);

module.exports = router;