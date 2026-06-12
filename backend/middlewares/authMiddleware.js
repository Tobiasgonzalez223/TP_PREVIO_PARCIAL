import jwt from "jsonwebtoken";
// En un entorno real, esta clave debe ir en un archivo .env
const SECRET = 'clave_secreta_tp'; 

const verifyToken = (req, res, next) => {
  // El token debe enviarse como Authorization: Bearer <token> [cite: 210]
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    // Debe devolver 401 si no se envía JWT [cite: 92]
    return res.status(401).json({ error: 'No se envió JWT. Acceso denegado.' }); 
  }

  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
    
    // Guardamos el payload del JWT (que no debe tener datos sensibles) en req.user [cite: 152]
    req.user = decoded; 
    next();
  });
};

export { verifyToken, SECRET };