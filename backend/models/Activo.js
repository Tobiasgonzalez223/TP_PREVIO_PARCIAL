import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Activo = sequelize.define("Activo", {
    id: { type: DataTypes.STRING, primaryKey: true },
    codigo: { type: DataTypes.STRING, allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.STRING, allowNull: false }, // equipo, instalación, etc.
    ubicacion: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.STRING, allowNull: false }, // operativo, con falla, baja
    criticidad: { type: DataTypes.STRING, allowNull: false } // baja, media, alta
  });
  return Activo;
};
