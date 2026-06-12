const fs = require('fs/promises');
const path = require('path');
// Usamos bcrypt para cumplir con la obligatoriedad de contraseñas seguras.
// Asegurate de tenerlo instalado: npm install bcrypt
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../models/db.json');

async function generarSemilla() {
  console.log('Generando datos semilla...');

  // Contraseña por defecto para todos: "123456"
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. USUARIOS (1 admin, 3 técnicos, 2 solicitantes para poder crear órdenes)
  const usuarios = [
    { id: 'usr-admin', nombre: 'Admin Sistema', email: 'admin@dds.com', passwordHash, rol: 'admin', activo: true },
    { id: 'usr-tec-1', nombre: 'Técnico Uno', email: 'tec1@dds.com', passwordHash, rol: 'tecnico', activo: true },
    { id: 'usr-tec-2', nombre: 'Técnico Dos', email: 'tec2@dds.com', passwordHash, rol: 'tecnico', activo: true },
    { id: 'usr-tec-3', nombre: 'Técnico Tres', email: 'tec3@dds.com', passwordHash, rol: 'tecnico', activo: true },
    { id: 'usr-sol-1', nombre: 'Pablo Solicitante', email: 'pablo@dds.com', passwordHash, rol: 'solicitante', activo: true },
    { id: 'usr-sol-2', nombre: 'Laura Solicitante', email: 'laura@dds.com', passwordHash, rol: 'solicitante', activo: true }
  ];

  // 2. ACTIVOS (Mínimo 8 activos obligatorios)
  const activos = [
    { id: 'act-1', codigo: 'AIRE-01', nombre: 'Aire Acondicionado Aula 1', tipo: 'equipo', ubicacion: 'Aula 1', estado: 'operativo', criticidad: 'media' },
    { id: 'act-2', codigo: 'AIRE-02', nombre: 'Aire Acondicionado Aula 2', tipo: 'equipo', ubicacion: 'Aula 2', estado: 'con_falla', criticidad: 'alta' },
    { id: 'act-3', codigo: 'PROY-01', nombre: 'Proyector Laboratorio', tipo: 'equipo', ubicacion: 'Lab Sistemas', estado: 'en_mantenimiento', criticidad: 'alta' },
    { id: 'act-4', codigo: 'PC-01', nombre: 'PC Docente Aula 3', tipo: 'equipo', ubicacion: 'Aula 3', estado: 'operativo', criticidad: 'media' },
    { id: 'act-5', codigo: 'SRV-01', nombre: 'Servidor Principal', tipo: 'instalacion', ubicacion: 'Data Center', estado: 'operativo', criticidad: 'alta' },
    { id: 'act-6', codigo: 'MESA-01', nombre: 'Mesa de reuniones', tipo: 'mobiliario', ubicacion: 'Sala Profesores', estado: 'con_falla', criticidad: 'baja' },
    { id: 'act-7', codigo: 'SW-01', nombre: 'Switch Red Piso 1', tipo: 'instalacion', ubicacion: 'Rack Piso 1', estado: 'operativo', criticidad: 'alta' },
    { id: 'act-8', codigo: 'LUM-01', nombre: 'Iluminación Pasillo', tipo: 'instalacion', ubicacion: 'Pasillo Central', estado: 'baja', criticidad: 'baja' }
  ];

  // 3. ÓRDENES (Mínimo 15 en distintos estados)
  const ordenes = [];
  const historial_ordenes = [];
  let ordenCount = 1;
  let histCount = 1;

  // Función helper para crear órdenes rápido y mantener el historial alineado
  const agregarOrden = (activoId, titulo, solicitanteId, tecnicoId, prioridad, estado) => {
    const id = `ord-${ordenCount++}`;
    const fechaCreacion = new Date(Date.now() - Math.random() * 10000000000).toISOString();
    
    // Regla de negocio: Si está resuelta, necesita fecha de resolución [cite: 49] y técnico asignado 
    const fechaResolucion = estado === 'resuelta' ? new Date().toISOString() : null;

    ordenes.push({
      id, activoId, titulo, descripcion: `Descripción generada para ${titulo}`,
      solicitanteId, tecnicoId, prioridad, estado, fechaCreacion, fechaResolucion
    });

    // Guardamos el historial inicial de creación para cumplir con la auditoría [cite: 51]
    historial_ordenes.push({
      id: `hist-${histCount++}`, ordenId: id, usuarioId: solicitanteId, accion: 'creacion',
      fechaHora: fechaCreacion, valorAnterior: null, valorNuevo: { estado: 'abierta' }
    });
  };

  // Generamos las 15 órdenes mezclando estados (abierta, asignada, en_proceso, resuelta, cancelada) [cite: 49]
  agregarOrden('act-1', 'Mantenimiento preventivo', 'usr-sol-1', null, 'media', 'abierta');
  agregarOrden('act-2', 'No enfría', 'usr-sol-2', 'usr-tec-1', 'alta', 'asignada');
  agregarOrden('act-2', 'Hace ruido raro', 'usr-sol-1', 'usr-tec-2', 'alta', 'en_proceso');
  agregarOrden('act-3', 'Lámpara quemada', 'usr-sol-1', 'usr-tec-3', 'alta', 'resuelta');
  agregarOrden('act-4', 'Windows no arranca', 'usr-sol-2', 'usr-tec-1', 'alta', 'resuelta');
  agregarOrden('act-5', 'Revisión de logs', 'usr-sol-1', 'usr-tec-2', 'urgente', 'en_proceso');
  agregarOrden('act-6', 'Pata rota', 'usr-sol-2', null, 'baja', 'abierta');
  agregarOrden('act-7', 'Luz roja parpadea', 'usr-sol-1', null, 'alta', 'abierta');
  agregarOrden('act-1', 'Limpieza de filtros', 'usr-sol-2', 'usr-tec-3', 'media', 'resuelta');
  agregarOrden('act-2', 'Pierde agua', 'usr-sol-1', null, 'alta', 'cancelada');
  agregarOrden('act-3', 'No enciende', 'usr-sol-2', 'usr-tec-1', 'urgente', 'asignada');
  agregarOrden('act-4', 'Actualizar antivirus', 'usr-sol-1', 'usr-tec-2', 'media', 'resuelta');
  agregarOrden('act-5', 'Backup falló', 'usr-sol-2', 'usr-tec-3', 'urgente', 'en_proceso');
  agregarOrden('act-6', 'Barnizar superficie', 'usr-sol-1', null, 'baja', 'cancelada');
  agregarOrden('act-7', 'Pérdida de paquetes', 'usr-sol-2', 'usr-tec-1', 'alta', 'resuelta');

  // Armamos el objeto final
  const db = { usuarios, activos, ordenes, historial_ordenes };

  // Escribimos en el archivo db.json
  try {
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    console.log('✅ Archivo db.json generado con éxito en /models');
    console.log('   - 8 Activos');
    console.log('   - 6 Usuarios (1 Admin, 3 Técnicos, 2 Solicitantes)');
    console.log('   - 15 Órdenes');
    console.log('   - Contraseña universal: 123456');
  } catch (error) {
    console.error('❌ Error al escribir db.json:', error);
  }
}

generarSemilla();