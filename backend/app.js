import express from "express";
import cors from "cors";

// 1.Importamos las rutas
import authRoutes from "./routes/auth.js";
import ordenesRoutes from "./routes/ordenes.js";
import activosRoutes from "./routes/activos.js"; // Importación correcta

// 2. Inicializamos la app 
const app = express();

// 3. Middlewares globales
app.use(cors());
app.use(express.json());

// 4. Rutas
app.use('/api/auth', authRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/activos', activosRoutes); // Uso correcto de app.use() DESPUÉS de declararla

// 5. Middleware de errores y exportación
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error detectado:', err.message || err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ error: message });
});

export default app;