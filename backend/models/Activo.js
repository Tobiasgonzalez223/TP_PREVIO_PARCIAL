import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Activo = sequelize.define("Activo", {
    id: { type: DataTypes.STRING, primaryKey: true },
    codigo: { type: DataTypes.STRING, allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.ENUM('equipo', 'instalacion', 'mobiliario', 'software'), allowNull: false }, // equipo, instalación, etc.
    ubicacion: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.ENUM("operativo", "con_falla", "en_mantenimiento", "baja"), allowNull: false }, // operativo, con falla, baja
    criticidad: { type: DataTypes.ENUM("baja", "media", "alta"), allowNull: false } // baja, media, alta
  });
  return Activo;
};
