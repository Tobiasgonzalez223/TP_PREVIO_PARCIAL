const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta', 'urgente'];
const ESTADOS_VALIDOS = ['abierta', 'asignada', 'en_proceso', 'resuelta', 'cancelada'];
const ROLES_VALIDOS = ['solicitante', 'tecnico', 'admin', 'mantenimiento'];

// Valida que los campos requeridos estén presentes y no vacíos
const validarCamposObligatorios = (campos) => {
  return (req, res, next) => {
    const faltantes = campos.filter(campo => {
      const valor = req.body[campo];
      return valor === undefined || valor === null || valor === '';
    });

    if (faltantes.length > 0) {
      return res.status(400).json({
        error: `Faltan campos obligatorios: ${faltantes.join(', ')}`
      });
    }

    next();
  };
};

// Valida el body de registro de usuario
const validarRegistro = (req, res, next) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, email, password' });
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  if (req.body.rol && !ROLES_VALIDOS.includes(req.body.rol)) {
    return res.status(400).json({
      error: `Rol inválido. Valores permitidos: ${ROLES_VALIDOS.join(', ')}`
    });
  }

  next();
};

// Valida el body de login
const validarLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: email, password' });
  }

  next();
};

// Valida el body de creación de orden
const validarCrearOrden = (req, res, next) => {
  const { activoId, titulo, descripcion, prioridad } = req.body;

  if (!activoId || !titulo || !descripcion || !prioridad) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: activoId, titulo, descripcion, prioridad'
    });
  }

  if (!PRIORIDADES_VALIDAS.includes(prioridad)) {
    return res.status(400).json({
      error: `Prioridad inválida. Valores permitidos: ${PRIORIDADES_VALIDAS.join(', ')}`
    });
  }

  next();
};

// Valida el body de edición de orden
const validarEditarOrden = (req, res, next) => {
  const { prioridad, estado } = req.body;

  if (prioridad && !PRIORIDADES_VALIDAS.includes(prioridad)) {
    return res.status(400).json({
      error: `Prioridad inválida. Valores permitidos: ${PRIORIDADES_VALIDAS.join(', ')}`
    });
  }

  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({
      error: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`
    });
  }

  next();
};

// Valida que se envíe tecnicoId al asignar
const validarAsignar = (req, res, next) => {
  const { tecnicoId } = req.body;

  if (!tecnicoId) {
    return res.status(400).json({ error: 'Falta campo obligatorio: tecnicoId' });
  }

  next();
};

export default validarCamposObligatorios;
export {
  validarRegistro,
  validarLogin,
  validarCrearOrden,
  validarEditarOrden,
  validarAsignar,
};