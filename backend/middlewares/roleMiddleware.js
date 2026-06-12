const verifyRole = (rolesPermitidos) => {
  return (req, res, next) => {
    // Verificamos si el rol del usuario logueado está dentro de los permitidos
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      // Debe devolver 403 si el usuario está autenticado pero no tiene permiso [cite: 93]
      return res.status(403).json({ error: 'No tiene permiso para realizar esta acción.' });
    }
    
    // Nota: La autorización también debe validar la propiedad del recurso cuando corresponda (ej. solicitante cancelando su propia orden)[cite: 198]. 
    // Esa lógica específica suele ir en el servicio o controlador.
    
    next();
  };
};

export default verifyRole;