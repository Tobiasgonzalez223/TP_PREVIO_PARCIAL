import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Orden = sequelize.define("Orden", {
    id: { type: DataTypes.STRING, primaryKey: true },
    activoId: { type: DataTypes.STRING, allowNull: false },
    titulo: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    solicitanteId: { type: DataTypes.STRING, allowNull: false },
    tecnicoId: { type: DataTypes.STRING, allowNull: true },
    prioridad: { type: DataTypes.STRING, allowNull: false }, // baja, media, alta, urgente
    estado: { type: DataTypes.STRING, allowNull: false }, // abierta, asignada, en proceso, resuelta, cancelada
    fechaCreacion: { type: DataTypes.DATE, allowNull: false },
    fechaResolucion: { type: DataTypes.DATE, allowNull: true }
  });
  return Orden;
};
