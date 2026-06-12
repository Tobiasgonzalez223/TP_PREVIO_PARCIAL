const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt'); // Asegurate de tener instalado bcrypt
const jwt = require('jsonwebtoken');
const { SECRET } = require('../middlewares/authMiddleware'); // Importamos el secreto que creaste antes

const dbPath = path.join(__dirname, '../models/db.json');

const leerDB = async () => JSON.parse(await fs.readFile(dbPath, 'utf-8'));
const guardarDB = async (db) => fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8');

const registrarUsuario = async (datos) => {
  const db = await leerDB();
  
  // Verificamos que el email no exista
  if (db.usuarios.find(u => u.email === datos.email)) {
    throw { status: 400, message: 'El email ya está registrado' };
  }

  // Hasheamos la contraseña de forma segura
  const passwordHash = await bcrypt.hash(datos.password, 10);
  
  const nuevoUsuario = {
    id: `usr-${Date.now()}`,
    nombre: datos.nombre,
    email: datos.email,
    passwordHash,
    rol: datos.rol || 'solicitante', // Rol por defecto
    activo: true
  };

  db.usuarios.push(nuevoUsuario);
  await guardarDB(db);
  
  // Devolvemos el usuario sin el passwordHash por seguridad
  return { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email, rol: nuevoUsuario.rol };
};

const autenticarUsuario = async (datos) => {
  const db = await leerDB();
  
  const usuario = db.usuarios.find(u => u.email === datos.email);
  if (!usuario || !usuario.activo) {
    throw { status: 401, message: 'Credenciales inválidas o usuario inactivo' };
  }

  // Comparamos la contraseña enviada con el hash
  const passwordValida = await bcrypt.compare(datos.password, usuario.passwordHash);
  if (!passwordValida) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  // Generamos el JWT sin datos sensibles
  const payload = { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre };
  const token = jwt.sign(payload, SECRET, { expiresIn: '4h' });

  return { token, usuario: payload };
};

module.exports = { registrarUsuario, autenticarUsuario };