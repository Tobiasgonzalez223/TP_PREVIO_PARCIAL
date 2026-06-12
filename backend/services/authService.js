import fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { SECRET } from "../middlewares/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../models/db.json");

const leerDB = async () =>
  JSON.parse(await fs.readFile(dbPath, "utf-8"));

const guardarDB = async (db) =>
  fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf-8");

const registrarUsuario = async (datos) => {
  const db = await leerDB();

  if (db.usuarios.find((u) => u.email === datos.email)) {
    throw { status: 400, message: "El email ya está registrado" };
  }

  const passwordHash = await bcrypt.hash(datos.password, 10);

  const nuevoUsuario = {
    id: `usr-${Date.now()}`,
    nombre: datos.nombre,
    email: datos.email,
    passwordHash,
    rol: datos.rol || "solicitante",
    activo: true,
  };

  db.usuarios.push(nuevoUsuario);
  await guardarDB(db);

  return {
    id: nuevoUsuario.id,
    nombre: nuevoUsuario.nombre,
    email: nuevoUsuario.email,
    rol: nuevoUsuario.rol,
  };
};

const autenticarUsuario = async (datos) => {
  const db = await leerDB();

  const usuario = db.usuarios.find((u) => u.email === datos.email);

  if (!usuario || !usuario.activo) {
    throw { status: 401, message: "Credenciales inválidas o usuario inactivo" };
  }

  const passwordValida = await bcrypt.compare(
    datos.password,
    usuario.passwordHash
  );

  if (!passwordValida) {
    throw { status: 401, message: "Credenciales inválidas" };
  }

  const payload = {
    id: usuario.id,
    rol: usuario.rol,
    nombre: usuario.nombre,
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: "4h" });

  return { token, usuario: payload };
};

export default {
  registrarUsuario,
  autenticarUsuario,
};