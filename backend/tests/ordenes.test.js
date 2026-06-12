const request = require('supertest');
const app = require('../app');

describe('Pruebas de Órdenes y Reglas de Negocio', () => {
  let tokenAdmin;
  let tokenSolicitante;
  let tokenTecnico;

  // Se ejecuta una vez antes de todos los tests para obtener los tokens
  beforeAll(async () => {
    // 1. Login del Admin
    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@dds.com', password: '123456' });
    tokenAdmin = resAdmin.body.token;

    // 2. Login del Solicitante
    const resSol = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pablo@dds.com', password: '123456' });
    tokenSolicitante = resSol.body.token;

    // 3. Login del Técnico
    const resTec = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tec1@dds.com', password: '123456' });
    tokenTecnico = resTec.body.token;

   });

  test('1. Listado de órdenes con y sin filtros [cite: 158]', async () => {
    // Sin filtros
    const resSinFiltro = await request(app)
      .get('/api/ordenes')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resSinFiltro.status).toBe(200);
    expect(Array.isArray(resSinFiltro.body)).toBe(true);

    // Con filtros
    const resConFiltro = await request(app)
      .get('/api/ordenes?estado=resuelta')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resConFiltro.status).toBe(200);
    expect(resConFiltro.body.every(o => o.estado === 'resuelta')).toBe(true);
  });

  test('2. Detalle de orden existente e inexistente [cite: 159]', async () => {
    // Inexistente
    const resInexistente = await request(app)
      .get('/api/ordenes/ord-99999')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resInexistente.status).toBe(404);

    // Existente (asumiendo que ord-1 existe por el seed)
    const resExistente = await request(app)
      .get('/api/ordenes/ord-1')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resExistente.status).toBe(200);
    expect(resExistente.body).toHaveProperty('id', 'ord-1');
  });

  test('3. Creación válida de una orden [cite: 160]', async () => {
    const response = await request(app)
      .post('/api/ordenes')
      .set('Authorization', `Bearer ${tokenSolicitante}`)
      .send({
        activoId: 'act-1', // Operativo, criticidad media
        titulo: 'Falla en test',
        descripcion: 'Test automatizado',
        prioridad: 'media'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.estado).toBe('abierta');
  });

  test('4. Creación inválida por activo dado de baja [cite: 161]', async () => {
    const response = await request(app)
      .post('/api/ordenes')
      .set('Authorization', `Bearer ${tokenSolicitante}`)
      .send({
        activoId: 'act-8', // Este activo está de baja en el seed
        titulo: 'Falla en activo de baja',
        descripcion: 'Test automatizado',
        prioridad: 'media'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/baja/i);
  });

  test('5. Creación inválida con prioridad baja para activo de criticidad alta [cite: 165]', async () => {
    const response = await request(app)
      .post('/api/ordenes')
      .set('Authorization', `Bearer ${tokenSolicitante}`)
      .send({
        activoId: 'act-2', // Criticidad alta en el seed
        titulo: 'Prioridad incorrecta',
        descripcion: 'Test automatizado',
        prioridad: 'baja'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/prioridad inválida/i);
  });

  test('6. Acceso con JWT de solicitante a una acción solo permitida para admin [cite: 164]', async () => {
    // Un solicitante intenta asignar un técnico
    const response = await request(app)
      .patch('/api/ordenes/ord-1/asignar')
      .set('Authorization', `Bearer ${tokenSolicitante}`)
      .send({ tecnicoId: 'usr-tec-1' });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBeDefined();
  });

  test('7. Resolución inválida de orden sin técnico asignado [cite: 162]', async () => {
    // ord-1 está abierta y sin técnico en el seed
    const response = await request(app)
      .patch('/api/ordenes/ord-1/resolver')
      .set('Authorization', `Bearer ${tokenTecnico}`); // Pasamos la validación de rol para llegar al servicio
    
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/técnico asignado/i);
  });

  test('8. Transición de estado no permitida (resolver orden cancelada) [cite: 166]', async () => {
    // ord-10 está cancelada en el seed
    const response = await request(app)
      .patch('/api/ordenes/ord-10/resolver')
      .set('Authorization', `Bearer ${tokenTecnico}`);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/cancelada/i);
  });
});
