import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Usuario = sequelize.define("Usuario", {
    id: { type: DataTypes.STRING, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    rol: { type: DataTypes.STRING, allowNull: false }, // solicitante, técnico, admin
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
  });
  return Usuario;
};
