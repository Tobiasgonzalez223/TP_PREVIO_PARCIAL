import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../models/db.json");

const leerDB = async () => JSON.parse(await fs.readFile(dbPath, 'utf-8'));
const guardarDB = async (db) => fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');

// Helper interno para registrar historial
const registrarHistorial = (db, ordenId, usuarioId, accion, valorAnterior, valorNuevo) => {
  db.historial_ordenes.push({
    id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ordenId,
    usuarioId,
    accion,
    fechaHora: new Date().toISOString(),
    valorAnterior: valorAnterior ? JSON.stringify(valorAnterior) : null,
    valorNuevo: valorNuevo ? JSON.stringify(valorNuevo) : null,
  });
};

const verificarActivoCriticidadPrioridad = (activo, prioridad) => {
  if (activo?.criticidad === 'alta' && prioridad === 'baja') {
    throw { status: 400, message: 'Prioridad inválida: activo de criticidad alta no admite prioridad baja' };
  }
};

const TRANSICIONES = {
  // flujo obligatorio: abierta → asignada → en_proceso → resuelta
  asignada: 'en_proceso',
  en_proceso: 'resuelta',
};

const permitirTransicion = (estadoActual, estadoDestino) => {
  // cancelada es un sumidero (no se transiciona a resuelta, etc.)
  if (estadoActual === 'cancelada') return false;
  if (estadoActual === 'resuelta') return false;

  if (estadoActual === 'abierta') {
    // se transiciona por asignar técnico (endpoint /asignar)
    return estadoDestino === 'asignada';
  }

  if (estadoActual === 'asignada') {
    return estadoDestino === TRANSICIONES.asignada;
  }

  if (estadoActual === 'en_proceso') {
    return estadoDestino === TRANSICIONES.en_proceso;
  }

  return false;
};

const obtenerHistorialAnteriorNuevoPorCambioEstado = (estadoAnterior, estadoNuevo) => ({
  valorAnterior: { estado: estadoAnterior },
  valorNuevo: { estado: estadoNuevo },
});

const obtenerTodas = async (query) => {
  const db = await leerDB();
  let ordenes = db.ordenes;

  if (query.activoId) ordenes = ordenes.filter(o => o.activoId === query.activoId);
  if (query.estado) ordenes = ordenes.filter(o => o.estado === query.estado);
  if (query.prioridad) ordenes = ordenes.filter(o => o.prioridad === query.prioridad);
  if (query.tecnicoId) ordenes = ordenes.filter(o => o.tecnicoId === query.tecnicoId);

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

  if (!activo) throw { status: 404, message: 'Activo inexistente' };
  if (activo.estado === 'baja') throw { status: 400, message: 'No se puede crear una orden sobre un activo dado de baja' };

  verificarActivoCriticidadPrioridad(activo, datos.prioridad);

  const nuevaOrden = {
    id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    activoId: datos.activoId,
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    solicitanteId: usuario.id,
    tecnicoId: datos.tecnicoId || null,
    prioridad: datos.prioridad,
    estado: datos.tecnicoId ? 'asignada' : 'abierta',
    fechaCreacion: new Date().toISOString(),
    fechaResolucion: null,
  };

  db.ordenes.push(nuevaOrden);

  // sincronizar estado del activo al crear
  activo.estado = 'con_falla';

  // historial: creación debe registrar estado inicial
  registrarHistorial(db, nuevaOrden.id, usuario.id, 'creacion', null, { estado: nuevaOrden.estado });

  await guardarDB(db);
  return nuevaOrden;
};

const editarOrden = async (id, datos, usuario) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === id);

  if (!orden) throw { status: 404, message: 'Orden no encontrada' };

  const estadoAnterior = { titulo: orden.titulo, descripcion: orden.descripcion, prioridad: orden.prioridad };

  if (datos.titulo) orden.titulo = datos.titulo;
  if (datos.descripcion) orden.descripcion = datos.descripcion;

  if (datos.prioridad) {
    const activo = db.activos.find(a => a.id === orden.activoId);
    verificarActivoCriticidadPrioridad(activo, datos.prioridad);
    orden.prioridad = datos.prioridad;
  }

  // historial: edición de campos
  registrarHistorial(db, orden.id, usuario.id, 'edicion', estadoAnterior, {
    titulo: orden.titulo,
    descripcion: orden.descripcion,
    prioridad: orden.prioridad,
  });

  await guardarDB(db);
  return orden;
};

const asignarTecnico = async (idOrden, tecnicoId, usuario) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === idOrden);

  if (!orden) throw { status: 404, message: 'Orden no encontrada' };
  if (orden.estado === 'cancelada' || orden.estado === 'resuelta') {
    throw { status: 400, message: 'No se puede asignar una orden resuelta o cancelada' };
  }

  // flujo: asignar técnico debe dejar la orden en asignada.
  // estado actual permitido: abierta
  const estadoAnterior = orden.estado;
  if (estadoAnterior !== 'abierta') {
    throw { status: 400, message: 'Transición de estado inválida: solo se puede asignar desde abierta' };
  }

  orden.tecnicoId = tecnicoId;
  // si se asigna, necesariamente va a asignada
  const estadoDestino = 'asignada';
  if (!permitirTransicion(estadoAnterior, estadoDestino)) {
    throw { status: 400, message: 'Transición de estado inválida' };
  }

  orden.estado = estadoDestino;

  const activo = db.activos.find(a => a.id === orden.activoId);
  if (activo) activo.estado = 'en_mantenimiento';

  // historial: asignación incluye cambio de estado y técnico
  registrarHistorial(db, orden.id, usuario.id, 'asignacion',
    { estado: estadoAnterior, tecnicoId: null },
    { estado: orden.estado, tecnicoId }
  );

  await guardarDB(db);
  return orden;
};

const pasarAEnProceso = async (idOrden, usuario) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === idOrden);

  if (!orden) throw { status: 404, message: 'Orden no encontrada' };
  if (orden.estado === 'cancelada' || orden.estado === 'resuelta') {
    throw { status: 400, message: 'No se puede cambiar el estado de una orden resuelta o cancelada' };
  }

  // flujo obligatorio: asignada -> en_proceso
  const estadoAnterior = orden.estado;
  const estadoDestino = 'en_proceso';
  if (orden.estado !== 'asignada') {
    throw { status: 400, message: 'Transición de estado inválida: solo se puede pasar a en_proceso desde asignada' };
  }
  if (!orden.tecnicoId) {
    throw { status: 400, message: 'No se puede pasar a en_proceso sin técnico asignado' };
  }
  if (!permitirTransicion(estadoAnterior, estadoDestino)) {
    throw { status: 400, message: 'Transición de estado inválida' };
  }

  orden.estado = estadoDestino;

  // historial: cambio de estado
  const { valorAnterior, valorNuevo } = obtenerHistorialAnteriorNuevoPorCambioEstado(estadoAnterior, estadoDestino);
  registrarHistorial(db, orden.id, usuario.id, 'cambio_estado', valorAnterior, valorNuevo);

  await guardarDB(db);
  return orden;
};

const resolverOrden = async (idOrden, usuario) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === idOrden);

  if (!orden) throw { status: 404, message: 'Orden no encontrada' };

  // regla: no resolver canceladas
  if (orden.estado === 'cancelada') throw { status: 400, message: 'No se puede resolver una orden cancelada' };

  if (!orden.tecnicoId) throw { status: 400, message: 'No se puede resolver una orden sin técnico asignado' };

  // flujo obligatorio: en_proceso -> resuelta
  const estadoAnterior = orden.estado;
  const estadoDestino = 'resuelta';

  if (estadoAnterior !== 'en_proceso') {
    throw { status: 400, message: 'Transición de estado inválida: solo se puede resolver desde en_proceso' };
  }
  if (!permitirTransicion(estadoAnterior, estadoDestino)) {
    throw { status: 400, message: 'Transición de estado inválida' };
  }

  orden.estado = estadoDestino;
  orden.fechaResolucion = new Date().toISOString();

  const activo = db.activos.find(a => a.id === orden.activoId);
  if (activo) activo.estado = 'operativo';

  registrarHistorial(db, orden.id, usuario.id, 'resolucion',
    obtenerHistorialAnteriorNuevoPorCambioEstado(estadoAnterior, estadoDestino).valorAnterior,
    obtenerHistorialAnteriorNuevoPorCambioEstado(estadoAnterior, estadoDestino).valorNuevo
  );

  await guardarDB(db);
  return orden;
};

const cancelarOrden = async (idOrden, usuario) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === idOrden);

  if (!orden) throw { status: 404, message: 'Orden no encontrada' };
  if (orden.estado === 'resuelta') throw { status: 400, message: 'No se puede cancelar una orden ya resuelta' };

  // PDF: cancelar cualquier orden no resuelta. Sin embargo el rol solicitante cancela propias abiertas.
  // admin/mantenimiento cancela cualquier.
  if (usuario.rol === 'solicitante') {
    if (orden.solicitanteId !== usuario.id || orden.estado !== 'abierta') {
      throw { status: 403, message: 'No tenés permiso para cancelar esta orden' };
    }
  }

  const estadoAnterior = orden.estado;
  const estadoDestino = 'cancelada';

  orden.estado = estadoDestino;

  registrarHistorial(db, orden.id, usuario.id, 'cancelacion',
    { estado: estadoAnterior },
    { estado: estadoDestino }
  );

  await guardarDB(db);
  return orden;
};

const generarResumen = async () => {
  const db = await leerDB();

  const ordenesPorEstado = db.ordenes.reduce((acc, o) => {
    acc[o.estado] = (acc[o.estado] || 0) + 1;
    return acc;
  }, {});

  const urgentes = db.ordenes.filter(o => o.prioridad === 'urgente' && o.estado !== 'resuelta' && o.estado !== 'cancelada').length;
  const sinTecnico = db.ordenes.filter(o => !o.tecnicoId && o.estado !== 'cancelada' && o.estado !== 'resuelta').length;

  const activosConMasFallas = (() => {
    const fallasPorActivo = {};
    for (const a of db.activos) fallasPorActivo[a.id] = 0;
    for (const o of db.ordenes) {
      if (o.estado !== 'cancelada' && o.estado !== 'resuelta') {
        fallasPorActivo[o.activoId] = (fallasPorActivo[o.activoId] || 0) + 1;
      }
    }
    const entries = Object.entries(fallasPorActivo).sort((x, y) => y[1] - x[1]);
    return entries.slice(0, 5).map(([activoId, fallas]) => {
      const activo = db.activos.find(a => a.id === activoId);
      return { activo: activo?.nombre || activoId, fallas };
    });
  })();

  return { ordenesPorEstado, urgentes, sinTecnico, activosConMasFallas };
};

const obtenerPorId = async (id) => {
  const db = await leerDB();
  const orden = db.ordenes.find(o => o.id === id);
  if (!orden) throw { status: 404, message: 'Orden no encontrada' };
  return orden;
};

const obtenerHistorialPorOrden = async (id) => {
  const db = await leerDB();
  return db.historial_ordenes.filter(h => h.ordenId === id);
};

export default {
  obtenerTodas,
  crearOrden,
  asignarTecnico,
  pasarAEnProceso,
  resolverOrden,
  cancelarOrden,
  generarResumen,
  obtenerPorId,
  obtenerHistorialPorOrden,
  editarOrden,
};

