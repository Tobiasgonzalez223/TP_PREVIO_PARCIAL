const activosService = require('../services/activosService');

const listar = async (req, res, next) => {
  try {
    const activos = await activosService.obtenerTodos();
    res.status(200).json(activos);
  } catch (error) {
    next(error);
  }
};

module.exports = { listar };