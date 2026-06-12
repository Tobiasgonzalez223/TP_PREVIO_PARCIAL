import activosService from '../services/activosService.js';

const listar = async (req, res, next) => {
  try {
    const activos = await activosService.obtenerTodos();
    res.status(200).json(activos);
  } catch (error) {
    next(error);
  }
};

export { listar };