const fs = require('fs/promises');
const path = require('path');

const dbPath = path.join(__dirname, '../models/db.json');

const obtenerTodos = async () => {
  const db = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
  return db.activos;
};

module.exports = { obtenerTodos };
