import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../models/db.json");

const obtenerTodos = async () => {
  const db = JSON.parse(await fs.readFile(dbPath, "utf-8"));
  return db.activos;
};

export default {
  obtenerTodos,
};