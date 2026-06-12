// Importamos el servicio de órdenes (donde irán todas las reglas de negocio)
const ordenesService = require('../services/ordenesService');

const listar = async (req, res, next) => {
  try {
    // Pasamos los query params para resolver filtros, paginación y ordenamiento [cite: 68, 192]
    const ordenes = await ordenesService.obtenerTodas(req.query);
    res.status(200).json(ordenes);
  } catch (error) {
    next(error);
  }
};

const obtenerResumen = async (req, res, next) => {
  try {
    const resumen = await ordenesService.generarResumen();
    res.status(200).json(resumen);
  } catch (error) {
    next(error);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const orden = await ordenesService.obtenerPorId(req.params.id);
    res.status(200).json(orden);
  } catch (error) {
    next(error);
  }
};

const obtenerHistorial = async (req, res, next) => {
  try {
    const historial = await ordenesService.obtenerHistorialPorOrden(req.params.id);
    res.status(200).json(historial);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    // Pasamos los datos del body y el usuario que hace la petición (extraído del JWT) [cite: 49]
    const nuevaOrden = await ordenesService.crearOrden(req.body, req.user);
    res.status(201).json(nuevaOrden);
  } catch (error) {
    next(error);
  }
};

const editar = async (req, res, next) => {
  try {
    const ordenEditada = await ordenesService.editarOrden(req.params.id, req.body, req.user);
    res.status(200).json(ordenEditada);
  } catch (error) {
    next(error);
  }
};

const cancelar = async (req, res, next) => {
  try {
    const ordenCancelada = await ordenesService.cancelarOrden(req.params.id, req.user);
    res.status(200).json(ordenCancelada);
  } catch (error) {
    next(error);
  }
};

const asignar = async (req, res, next) => {
  try {
    // Esperamos recibir el tecnicoId en el body para hacer la asignación [cite: 49]
    const ordenAsignada = await ordenesService.asignarTecnico(req.params.id, req.body.tecnicoId, req.user);
    res.status(200).json(ordenAsignada);
  } catch (error) {
    next(error);
  }
};

const resolver = async (req, res, next) => {
  try {
    // Solo se requiere el ID de la orden y el usuario logueado para verificar permisos
    const ordenResuelta = await ordenesService.resolverOrden(req.params.id, req.user);
    res.status(200).json(ordenResuelta);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listar,
  obtenerResumen,
  obtenerPorId,
  obtenerHistorial,
  crear,
  editar,
  cancelar,
  asignar,
  resolver
};