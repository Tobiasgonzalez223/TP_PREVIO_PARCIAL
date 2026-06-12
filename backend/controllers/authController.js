// Importamos el servicio de autenticación (lo vas a crear en la carpeta services)
import authService from '../services/authService.js';

const register = async (req, res, next) => {
  try {
    // Delegamos la creación del usuario al servicio
    const nuevoUsuario = await authService.registrarUsuario(req.body);
    // Respondemos con código 201 (Created)
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    // Si falla una validación en el servicio, pasamos el error al manejador central
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // El servicio validará la contraseña y generará el JWT
    const credenciales = await authService.autenticarUsuario(req.body);
    res.status(200).json(credenciales);
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login
};