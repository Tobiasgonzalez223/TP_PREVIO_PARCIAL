import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Usuario = sequelize.define("Usuario", {
    id: { type: DataTypes.STRING, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    rol: { type: DataTypes.ENUM('solicitante', 'tecnico', 'mantenimiento', 'admin'), allowNull: false, defaultValue: "solicitante" }, // solicitante, técnico, admin
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
  });
  return Usuario;
};
