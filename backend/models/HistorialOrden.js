import { DataTypes } from "sequelize";

export default (sequelize) => {
  const HistorialOrden = sequelize.define("HistorialOrden", {
    id: { type: DataTypes.STRING, primaryKey: true },
    ordenId: { type: DataTypes.STRING, allowNull: false },
    usuarioId: { type: DataTypes.STRING, allowNull: false },
    accion: { type: DataTypes.STRING, allowNull: false }, // creación, asignación, cambio estado, etc.
    fechaHora: { type: DataTypes.DATE, allowNull: false },
    valorAnterior: { type: DataTypes.JSON, allowNull: true },
    valorNuevo: { type: DataTypes.JSON, allowNull: true }
  });
  return HistorialOrden;
};
