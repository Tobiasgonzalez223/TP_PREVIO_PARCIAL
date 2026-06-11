import { Sequelize } from "sequelize"
import UsuarioModel from "./Usuario.js"
import ActivoModel from "./Activo.js"
import OrdenModel from "./Orden.js"
import HistorialOrdenModel from "./HistorialOrden.js"

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false
})

//Inicializar modelos
const Usuario = UsuarioModel(sequelize)
const Activo = ActivoModel(sequelize)
const Orden = OrdenModel(sequelize)
const HistorialOrden = HistorialOrdenModel(sequelize)

// Relaciones
Usuario.hasMany(Orden, { foreignKey: "solicitanteId", as: "ordenesSolicitadas" });
Usuario.hasMany(Orden, { foreignKey: "tecnicoId", as: "ordenesAsignadas" });
Orden.belongsTo(Usuario, { foreignKey: "solicitanteId", as: "solicitante" });
Orden.belongsTo(Usuario, { foreignKey: "tecnicoId", as: "tecnico" });

Activo.hasMany(Orden, { foreignKey: "activoId", as: "ordenes" });
Orden.belongsTo(Activo, { foreignKey: "activoId", as: "activo" });

Orden.hasMany(HistorialOrden, { foreignKey: "ordenId", as: "historial" });
HistorialOrden.belongsTo(Orden, { foreignKey: "ordenId" });
HistorialOrden.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

export { sequelize, Usuario, Activo, Orden, HistorialOrden };