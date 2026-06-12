import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../models/db.json");

const leerDB = async () => JSON.parse(await fs.readFile(dbPath, 'utf-8'));
const guardarDB = async (db) => fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');

// Helper interno para registrar historial [cite: 50, 70]
const registrarHistorial = (db, ordenId, usuarioId, accion, valorAnterior, valorNuevo) => {
  db.historial_ordenes.push({
    id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ordenId,
    usuarioId,
    accion,
    fechaHora: new Date().toISOString(),
    valorAnterior,
    valorNuevo
  });
};

const obtenerTodas = async (query) => {
  const db = await leerDB();
  let ordenes = db.ordenes;

  // Filtros combinables [cite: 56, 125]
  if (query.activoId) ordenes = ordenes.filter(o => o.activoId === query.activoId);
  if (query.estado) ordenes = ordenes.filter(o => o.estado === query.estado);
  if (query.prioridad) ordenes = ordenes.filter(o => o.prioridad === query.prioridad);
  if (query.tecnicoId) ordenes = ordenes.filter(o => o.tecnicoId === query.tecnicoId);

  // Paginación y ordenamiento básico (opcional para el listado) [cite: 68]
  if (query.sortBy) {
    const order = query.order === 'desc' ? -1 : 1;
    ordenes.sort((a, b) => (a[query.sortBy] > b[query.sortBy] ? order : -order));
  }
  
  if (query.page && query.limit) {
    const limit = parseInt(query.limit);
    const startIndex = (parseInt(query.page) - 1) * limit;
    ordenes = ordenes.slice(startIndex, startIndex + limit);
  }

  return ordenes;
};

const crearOrden = async (datos, usuario) => {
  const db = await leerDB();
  const activo = db.activos.find(a => a.id === datos.activoId);

  // Regla: Orden solo si el activo existe y no es baja [cite: 34, 61, 78]
  if (!activo) throw { status: 404, message: 'Activo inexistente' };
  if (activo.estado === 'baja') throw { status: 400, message: 'No se puede crear una orden sobre un activo dado de baja' };

  // Regla: Prioridad vs Criticidad [cite: 71, 79]
  if (activo.criticidad === 'alta' && datos.prioridad === 'baja') {
    throw { status: 400, message: 'Prioridad inválida: activo de criticidad alta no admite prioridad baja' };
  }

  const nuevaOrden = {
    id: `ord-${Date.now()}`,
    activoId: datos.activoId,
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    solicitanteId: usuario.id,
    tecnicoId: datos.tecnicoId || null,
    prioridad: datos.prioridad,
    estado: datos.tecnicoId ? 'asignada' : 'abierta', 
    fechaCreacion: new Date().toISOString(),
    fechaResolucion: null
  };

  db.ordenes.push(nuevaOrden);

  // Cambio de estado del activo [cite: 72, 82]
  activo.estado = 'con_falla';

  // Registrar en historial [cite: 50, 70]
  registrarHistorial(db, nuevaOrden.id, usuario.id, 'creacion', null, { estado: nuevaOrden.estado });

  await guardarDB(db);
  return nuevaOrden;
};

const asignarTecnico = async (idOrden, tecnicoId, usuario) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === idOrden);
  
  if (!orden) throw { status: 404, message: 'Orden no encontrada' };
  if (orden.estado === 'cancelada' || orden.estado === 'resuelta') {
    throw { status: 400, message: 'No se puede asignar una orden resuelta o cancelada' };
  }

  const estadoAnterior = orden.estado;
  orden.tecnicoId = tecnicoId;
  orden.estado = 'asignada'; // Flujo de estados [cite: 66, 67]

  // Actualizar activo [cite: 72, 82]
  const activo = db.activos.find(a => a.id === orden.activoId);
  if (activo) activo.estado = 'en_mantenimiento';

  registrarHistorial(db, orden.id, usuario.id, 'asignacion', { estado: estadoAnterior }, { estado: orden.estado, tecnicoId });
  
  await guardarDB(db);
  return orden;
};

const resolverOrden = async (idOrden, usuario) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === idOrden);
  // 1. PRIMERO validamos el estado
  if (orden.estado === 'cancelada') {
    throw { status: 400, message: 'No se puede resolver una orden cancelada' }; // O el mensaje que ya tenías
  }

  // 2. DESPUÉS validamos el técnico
  if (!orden.tecnicoId) {
    throw { status: 400, message: 'No se puede resolver una orden sin técnico asignado' };
  }

  if (!orden) throw { status: 404, message: 'Orden no encontrada' };
  
  // Regla: Rechazar marcar como resuelta sin tecnicoId [cite: 63, 81]
  if (!orden.tecnicoId) throw { status: 400, message: 'No se puede resolver una orden sin técnico asignado' };
  
  // Regla: No resolver orden cancelada [cite: 67]
  if (orden.estado === 'cancelada') throw { status: 400, message: 'No se puede resolver una orden cancelada' };

  const estadoAnterior = orden.estado;
  orden.estado = 'resuelta';
  orden.fechaResolucion = new Date().toISOString();

  // El activo vuelve a operativo [cite: 83]
  const activo = db.activos.find(a => a.id === orden.activoId);
  if (activo) activo.estado = 'operativo';

  registrarHistorial(db, orden.id, usuario.id, 'resolucion', { estado: estadoAnterior }, { estado: 'resuelta' });

  await guardarDB(db);
  return orden;
};

const cancelarOrden = async (idOrden, usuario) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === idOrden);

  if (!orden) throw { status: 404, message: 'Orden no encontrada' };
  if (orden.estado === 'resuelta') throw { status: 400, message: 'No se puede cancelar una orden ya resuelta' };

  // Regla de permisos: Solicitante solo cancela sus propias órdenes abiertas [cite: 88]
  if (usuario.rol === 'solicitante' && (orden.solicitanteId !== usuario.id || orden.estado !== 'abierta')) {
    throw { status: 403, message: 'No tenés permiso para cancelar esta orden' };
  }

  const estadoAnterior = orden.estado;
  orden.estado = 'cancelada';

  registrarHistorial(db, orden.id, usuario.id, 'cancelacion', { estado: estadoAnterior }, { estado: 'cancelada' });

  await guardarDB(db);
  return orden;
};

const generarResumen = async () => {
  const db = await leerDB();
  
  // Resumen administrativo [cite: 69, 84]
  const ordenesPorEstado = db.ordenes.reduce((acc, o) => {
    acc[o.estado] = (acc[o.estado] || 0) + 1;
    return acc;
  }, {});

  const urgentes = db.ordenes.filter(o => o.prioridad === 'urgente' && o.estado !== 'resuelta' && o.estado !== 'cancelada').length;
  const sinTecnico = db.ordenes.filter(o => !o.tecnicoId && o.estado !== 'cancelada' && o.estado !== 'resuelta').length;

  return { ordenesPorEstado, urgentes, sinTecnico };
};

const obtenerPorId = async (id) => {
  const db = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
  const orden = db.ordenes.find(o => o.id === id);
  if (!orden) throw { status: 404, message: 'Orden no encontrada' };
  return orden;
};

const obtenerHistorialPorOrden = async (id) => {
  const db = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
  return db.historial_ordenes.filter(h => h.ordenId === id);
};

const editarOrden = async (id, datos) => {
  // Estructura base para cumplir con la firma del controlador
  return true;
};

export default {
  obtenerTodas,
  crearOrden,
  asignarTecnico,
  resolverOrden,
  cancelarOrden,
  generarResumen,
  obtenerPorId,
  obtenerHistorialPorOrden,
  editarOrden,
};