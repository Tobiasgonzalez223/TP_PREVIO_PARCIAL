const request = require('supertest');
const app = require('../app'); // Importamos la app, no el server.js

describe('Pruebas de Autenticación y Seguridad', () => {
  
  test('1. Login correcto - Debe devolver 200 y un token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@dds.com',
        password: '123456'
      });

    // Las pruebas deben verificar status HTTP y cuerpo JSON relevante
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('usuario');
  });

  test('2. Login inválido - Debe devolver 401 con credenciales erróneas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@dds.com',
        password: 'clave_incorrecta'
      });

    // Las pruebas deben verificar status HTTP y cuerpo JSON relevante
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('3. Acceso denegado - Debe devolver 401 si no se envía JWT en ruta protegida', async () => {
    // Intentamos acceder a las órdenes sin enviar el header Authorization
    const response = await request(app).get('/api/ordenes');

    // Las pruebas deben verificar status HTTP y cuerpo JSON relevante
    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });

});