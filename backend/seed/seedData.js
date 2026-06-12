import bcrypt from "bcrypt";
import { sequelize, Usuario, Activo, Orden, HistorialOrden } from "../models/index.js";

async function generarSemilla() {
  console.log("🌱 Iniciando generación de datos semilla...");

  // Sincroniza y recrea todas las tablas
  await sequelize.sync({ force: true });
  console.log("✅ Tablas creadas/recreadas en database.sqlite");

  // ── USUARIOS ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("123456", 10);

  await Usuario.bulkCreate([
    { id: "usr-admin", nombre: "Admin Sistema",      email: "admin@dds.com",  passwordHash, rol: "admin",       activo: true },
    { id: "usr-tec-1", nombre: "Técnico Uno",        email: "tec1@dds.com",   passwordHash, rol: "tecnico",     activo: true },
    { id: "usr-tec-2", nombre: "Técnico Dos",        email: "tec2@dds.com",   passwordHash, rol: "tecnico",     activo: true },
    { id: "usr-tec-3", nombre: "Técnico Tres",       email: "tec3@dds.com",   passwordHash, rol: "tecnico",     activo: true },
    { id: "usr-sol-1", nombre: "Pablo Solicitante",  email: "pablo@dds.com",  passwordHash, rol: "solicitante", activo: true },
    { id: "usr-sol-2", nombre: "Laura Solicitante",  email: "laura@dds.com",  passwordHash, rol: "solicitante", activo: true },
  ]);
  console.log("✅ 6 Usuarios creados (1 admin, 3 técnicos, 2 solicitantes)");

  // ── ACTIVOS ───────────────────────────────────────────────────────────────
  await Activo.bulkCreate([
    { id: "act-1", codigo: "AIRE-01",  nombre: "Aire Acondicionado Aula 1", tipo: "equipo",      ubicacion: "Aula 1",          estado: "operativo",        criticidad: "media" },
    { id: "act-2", codigo: "AIRE-02",  nombre: "Aire Acondicionado Aula 2", tipo: "equipo",      ubicacion: "Aula 2",          estado: "con_falla",        criticidad: "alta"  },
    { id: "act-3", codigo: "PROY-01",  nombre: "Proyector Laboratorio",     tipo: "equipo",      ubicacion: "Lab Sistemas",    estado: "en_mantenimiento", criticidad: "alta"  },
    { id: "act-4", codigo: "PC-01",    nombre: "PC Docente Aula 3",         tipo: "equipo",      ubicacion: "Aula 3",          estado: "operativo",        criticidad: "media" },
    { id: "act-5", codigo: "SRV-01",   nombre: "Servidor Principal",        tipo: "instalacion", ubicacion: "Data Center",     estado: "operativo",        criticidad: "alta"  },
    { id: "act-6", codigo: "MESA-01",  nombre: "Mesa de reuniones",         tipo: "mobiliario",  ubicacion: "Sala Profesores", estado: "con_falla",        criticidad: "baja"  },
    { id: "act-7", codigo: "SW-01",    nombre: "Switch Red Piso 1",         tipo: "instalacion", ubicacion: "Rack Piso 1",     estado: "operativo",        criticidad: "alta"  },
    { id: "act-8", codigo: "LUM-01",   nombre: "Iluminación Pasillo",       tipo: "instalacion", ubicacion: "Pasillo Central", estado: "baja",             criticidad: "baja"  },
  ]);
  console.log("✅ 8 Activos creados");

  // ── ÓRDENES + HISTORIAL ───────────────────────────────────────────────────
  // Definimos las 15 órdenes como datos planos
  const ordenesData = [
    { id: "ord-1",  activoId: "act-1", titulo: "Mantenimiento preventivo",  solicitanteId: "usr-sol-1", tecnicoId: null,       prioridad: "media",   estado: "abierta"    },
    { id: "ord-2",  activoId: "act-2", titulo: "No enfría",                  solicitanteId: "usr-sol-2", tecnicoId: "usr-tec-1", prioridad: "alta",    estado: "asignada"   },
    { id: "ord-3",  activoId: "act-2", titulo: "Hace ruido raro",            solicitanteId: "usr-sol-1", tecnicoId: "usr-tec-2", prioridad: "alta",    estado: "en_proceso" },
    { id: "ord-4",  activoId: "act-3", titulo: "Lámpara quemada",            solicitanteId: "usr-sol-1", tecnicoId: "usr-tec-3", prioridad: "alta",    estado: "resuelta"   },
    { id: "ord-5",  activoId: "act-4", titulo: "Windows no arranca",         solicitanteId: "usr-sol-2", tecnicoId: "usr-tec-1", prioridad: "alta",    estado: "resuelta"   },
    { id: "ord-6",  activoId: "act-5", titulo: "Revisión de logs",           solicitanteId: "usr-sol-1", tecnicoId: "usr-tec-2", prioridad: "urgente", estado: "en_proceso" },
    { id: "ord-7",  activoId: "act-6", titulo: "Pata rota",                  solicitanteId: "usr-sol-2", tecnicoId: null,       prioridad: "baja",    estado: "abierta"    },
    { id: "ord-8",  activoId: "act-7", titulo: "Luz roja parpadea",          solicitanteId: "usr-sol-1", tecnicoId: null,       prioridad: "alta",    estado: "abierta"    },
    { id: "ord-9",  activoId: "act-1", titulo: "Limpieza de filtros",        solicitanteId: "usr-sol-2", tecnicoId: "usr-tec-3", prioridad: "media",   estado: "resuelta"   },
    { id: "ord-10", activoId: "act-2", titulo: "Pierde agua",                solicitanteId: "usr-sol-1", tecnicoId: null,       prioridad: "alta",    estado: "cancelada"  },
    { id: "ord-11", activoId: "act-3", titulo: "No enciende",                solicitanteId: "usr-sol-2", tecnicoId: "usr-tec-1", prioridad: "urgente", estado: "asignada"   },
    { id: "ord-12", activoId: "act-4", titulo: "Actualizar antivirus",       solicitanteId: "usr-sol-1", tecnicoId: "usr-tec-2", prioridad: "media",   estado: "resuelta"   },
    { id: "ord-13", activoId: "act-5", titulo: "Backup falló",               solicitanteId: "usr-sol-2", tecnicoId: "usr-tec-3", prioridad: "urgente", estado: "en_proceso" },
    { id: "ord-14", activoId: "act-6", titulo: "Barnizar superficie",        solicitanteId: "usr-sol-1", tecnicoId: null,       prioridad: "baja",    estado: "cancelada"  },
    { id: "ord-15", activoId: "act-7", titulo: "Pérdida de paquetes",        solicitanteId: "usr-sol-2", tecnicoId: "usr-tec-1", prioridad: "alta",    estado: "resuelta"   },
  ];

  // Construimos las órdenes con fechas y el historial correspondiente
  const ordenes = [];
  const historialOrdenes = [];
  let histCount = 1;

  for (const o of ordenesData) {
    const fechaCreacion = new Date(Date.now() - Math.random() * 10_000_000_000);
    const fechaResolucion = o.estado === "resuelta" ? new Date() : null;

    ordenes.push({
      ...o,
      descripcion: `Descripción detallada para: ${o.titulo}`,
      fechaCreacion,
      fechaResolucion,
    });

    // Historial de creación (siempre)
    historialOrdenes.push({
      id: `hist-${histCount++}`,
      ordenId: o.id,
      usuarioId: o.solicitanteId,
      accion: "creacion",
      fechaHora: fechaCreacion,
      valorAnterior: null,
      valorNuevo: { estado: "abierta" },
    });

    // Historial de asignación si tiene técnico
    if (o.tecnicoId) {
      historialOrdenes.push({
        id: `hist-${histCount++}`,
        ordenId: o.id,
        usuarioId: "usr-admin",
        accion: "asignacion",
        fechaHora: new Date(fechaCreacion.getTime() + 3_600_000),
        valorAnterior: { tecnicoId: null, estado: "abierta" },
        valorNuevo: { tecnicoId: o.tecnicoId, estado: "asignada" },
      });
    }

    // Historial de cambio de estado si avanzó más allá de asignada
    if (["en_proceso", "resuelta", "cancelada"].includes(o.estado)) {
      historialOrdenes.push({
        id: `hist-${histCount++}`,
        ordenId: o.id,
        usuarioId: o.tecnicoId || "usr-admin",
        accion: "cambio_estado",
        fechaHora: new Date(fechaCreacion.getTime() + 7_200_000),
        valorAnterior: { estado: o.tecnicoId ? "asignada" : "abierta" },
        valorNuevo: { estado: o.estado },
      });
    }
  }

  await Orden.bulkCreate(ordenes);
  console.log("✅ 15 Órdenes creadas");

  await HistorialOrden.bulkCreate(historialOrdenes);
  console.log(`✅ ${historialOrdenes.length} Registros de historial creados`);

  // ── RESUMEN FINAL ─────────────────────────────────────────────────────────
  console.log("\n🎉 Semilla completada exitosamente!");
  console.log("   Contraseña universal: 123456");
  console.log("   Usuarios de prueba:");
  console.log("     admin@dds.com   → rol: admin");
  console.log("     tec1@dds.com    → rol: tecnico");
  console.log("     pablo@dds.com   → rol: solicitante");

  await sequelize.close();
}

generarSemilla().catch((err) => {
  console.error("❌ Error al generar semilla:", err);
  process.exit(1);
});