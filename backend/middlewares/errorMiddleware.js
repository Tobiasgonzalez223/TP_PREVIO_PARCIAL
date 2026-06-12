// Middleware de manejo de errores con firma (err, req, res, next) [cite: 115]
const errorHandler = (err, req, res, next) => {
  console.error('[Error capturado]:', err.message || err);
  
  // Usar status HTTP coherentes [cite: 118]
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  
  // Las respuestas de error deben tener JSON claro [cite: 119]
  res.status(status).json({ error: message }); 
};

module.exports = errorHandler;