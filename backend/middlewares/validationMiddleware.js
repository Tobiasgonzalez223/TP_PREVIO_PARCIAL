const validarCamposObligatorios = (campos) => {
  return (req, res, next) => {
    const faltantes = campos.filter(campo => !req.body[campo]);
    
    if (faltantes.length > 0) {
      // Los errores de validación deben responder con status coherente, normalmente 400, y JSON claro [cite: 197]
      return res.status(400).json({ 
        error: `Faltan campos obligatorios: ${faltantes.join(', ')}` 
      });
    }
    
    next();
  };
};

module.exports = validarCamposObligatorios;