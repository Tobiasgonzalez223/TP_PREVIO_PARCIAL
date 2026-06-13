# Sistema de Control de Órdenes de Mantenimiento

Aplicación full stack para gestionar órdenes de mantenimiento sobre activos. Permite registrar órdenes, asignar técnicos, controlar estados y ver historial de cambios.

---

## Tecnologías

- **Backend**: Node.js + Express, JWT, bcrypt, persistencia en `db.json`
- **Frontend**: React 19 + Vite + TypeScript, React Router v7, Axios

---

## Instrucciones para ejecutar

### Backend

```bash
cd backend
npm install
npm start
```

El servidor corre en `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El cliente corre en `http://localhost:5173`.

---

## Usuarios de prueba

| Rol           | Email              | Contraseña |
|---------------|--------------------|------------|
| admin         | admin@dds.com      | 123456     |
| técnico       | tec1@dds.com       | 123456     |
| técnico       | tec2@dds.com       | 123456     |
| técnico       | tec3@dds.com       | 123456     |
| solicitante   | pablo@dds.com      | 123456     |
| solicitante   | laura@dds.com      | 123456     |

> Las contraseñas se almacenan hasheadas con bcrypt (salt rounds = 10).

---

## Endpoints principales del backend

### Autenticación
| Método | Ruta                  | Descripción                        | Auth |
|--------|-----------------------|------------------------------------|------|
| POST   | /api/auth/register    | Registrar nuevo usuario            | No   |
| POST   | /api/auth/login       | Iniciar sesión y obtener JWT       | No   |

### Activos
| Método | Ruta          | Descripción              | Auth |
|--------|---------------|--------------------------|------|
| GET    | /api/activos  | Listar todos los activos | Sí   |

### Órdenes
| Método | Ruta                        | Descripción                                 | Roles permitidos                   |
|--------|-----------------------------|---------------------------------------------|------------------------------------|
| GET    | /api/ordenes                | Listar órdenes (filtros + paginación)       | Todos                              |
| GET    | /api/ordenes/resumen        | Resumen administrativo                      | admin, mantenimiento               |
| GET    | /api/ordenes/:id            | Detalle de una orden                        | Todos                              |
| GET    | /api/ordenes/:id/historial  | Historial de cambios de una orden           | Todos                              |
| POST   | /api/ordenes                | Crear nueva orden                           | solicitante, admin, mantenimiento  |
| PUT    | /api/ordenes/:id            | Editar título, descripción o prioridad      | solicitante (propia), admin, mant. |
| PATCH  | /api/ordenes/:id/cancelar   | Cancelar una orden                          | solicitante (propia abierta), admin, mant. |
| PATCH  | /api/ordenes/:id/asignar    | Asignar técnico (abierta → asignada)        | admin, mantenimiento               |
| PATCH  | /api/ordenes/:id/en_proceso | Iniciar trabajo (asignada → en_proceso)     | tecnico                            |
| PATCH  | /api/ordenes/:id/resolver   | Resolver orden (en_proceso → resuelta)      | tecnico                            |

### Filtros disponibles en GET /api/ordenes

```
GET /api/ordenes?activoId=act-001&estado=abierta&prioridad=alta&tecnicoId=usr-tec1&page=1&limit=10&sortBy=fechaCreacion&order=desc
```

---

## Rutas del frontend

| Ruta             | Descripción                                     | Protegida | Roles              |
|------------------|-------------------------------------------------|-----------|--------------------|
| /login           | Login y registro                                | No        | —                  |
| /ordenes         | Listado de órdenes con filtros                  | Sí        | Todos              |
| /ordenes/:id     | Detalle de orden con historial y acciones       | Sí        | Todos              |
| /ordenes/nueva   | Formulario para crear una orden                 | Sí        | Todos              |
| /resumen         | Panel de resumen administrativo                 | Sí        | admin, mantenimiento |
| *                | Página 404 – ruta no encontrada                 | No        | —                  |

---

## Validación de activo, prioridad y estado

### Activo
- La orden solo puede crearse sobre activos existentes que **no estén en estado `baja`**.
- Error `404` si el activo no existe; `400` si está dado de baja.

### Prioridad
- Valores válidos: `baja`, `media`, `alta`, `urgente`.
- Si el activo tiene `criticidad = alta`, la prioridad **no puede ser `baja`** (error `400`).

### Estado – máquina de estados
```
abierta → asignada    (vía PATCH /asignar, solo admin/mantenimiento)
asignada → en_proceso (vía PATCH /en_proceso, solo técnico)
en_proceso → resuelta (vía PATCH /resolver, solo técnico, requiere tecnicoId)
cualquier no-resuelta → cancelada (vía PATCH /cancelar)
```
- No se puede resolver una orden cancelada (error `400`).
- No se puede resolver sin técnico asignado (error `400`).
- Toda transición fuera del flujo devuelve `400` con mensaje descriptivo.

---

## JWT, roles y permisos

### Token
- Se genera al hacer login exitoso con `HS256`.
- **Payload**: `{ id, rol, nombre }` — sin contraseña ni datos sensibles.
- Expiración: 4 horas.
- El frontend lo almacena en `localStorage` y lo envía como `Authorization: Bearer <token>` via interceptor Axios.

### Permisos por rol

| Acción                        | solicitante | tecnico | admin / mantenimiento |
|-------------------------------|-------------|---------|-----------------------|
| Crear orden                   | ✓           | ✗       | ✓                     |
| Ver órdenes                   | ✓           | ✓       | ✓                     |
| Cancelar propia orden abierta | ✓           | ✗       | ✓                     |
| Cancelar cualquier orden      | ✗           | ✗       | ✓                     |
| Asignar técnico               | ✗           | ✗       | ✓                     |
| Pasar a en_proceso            | ✗           | ✓       | ✗                     |
| Resolver orden                | ✗           | ✓       | ✗                     |
| Ver resumen administrativo    | ✗           | ✗       | ✓                     |

Errores de autenticación/autorización:
- **401**: sin JWT o JWT inválido/expirado.
- **403**: JWT válido pero sin permisos para la acción.

---

## Ejecutar pruebas

```bash
cd backend
npm test
```

Casos cubiertos (Jest + Supertest):

1. Login correcto e inválido
2. Listado de órdenes con y sin filtros
3. Detalle de orden existente e inexistente
4. Creación válida de una orden
5. Creación inválida por activo dado de baja
6. Resolución inválida sin técnico asignado
7. Acceso sin JWT a ruta protegida
8. Acceso con JWT de solicitante a acción solo de admin
9. Creación inválida con prioridad baja para activo de criticidad alta
10. Transición de estado no permitida (resolver una orden cancelada)

---

## Estructura del proyecto

```
TP_PREVIO_PARCIAL/
├── backend/
│   ├── controllers/     authController, ordenesController, activosController
│   ├── routes/          auth.js, ordenes.js, activos.js, usuarios.js
│   ├── services/        authService (JWT+bcrypt), ordenesService (reglas de negocio), activosService
│   ├── middlewares/     authMiddleware (JWT), roleMiddleware, validationMiddleware, errorMiddleware
│   ├── models/          db.json (persistencia), modelos Sequelize/SQLite
│   ├── seed/            seedData.js
│   ├── tests/           auth.test.js, ordenes.test.js
│   ├── app.js
│   └── server.js
└── frontend/
    └── src/
        ├── context/     AuthContext.jsx (user, login, logout, register)
        ├── routes/      AppRouter.jsx (React Router, rutas protegidas por rol)
        ├── components/  LoginForm, OrdenList, OrdenDetail, OrdenForm, ResumenPanel, HistorialOrden, Layout
        ├── pages/       LoginPage, OrdenesPage, OrdenDetailPage, OrdenFormPage, ResumenPage, NotFoundPage
        ├── services/    api.ts (Axios + interceptor Bearer), authService, ordenesService, activosService, usuariosService
        └── main.tsx     Entry point: BrowserRouter > AuthProvider > AppRouter
```

---

## Decisiones de arquitectura

- **Persistencia en `db.json`**: datos persisten entre reinicios sin necesidad de configurar una base de datos. Los modelos Sequelize/SQLite están definidos para una migración futura.
- **Historial automático**: todo cambio sobre una orden (creación, asignación, edición, cambio de estado, resolución, cancelación) se registra en `historial_ordenes` con fecha, usuario, acción y valores anterior/nuevo.
- **Reglas de negocio en el servicio**: toda validación de dominio (activo, prioridad, estado) vive en `backend/services/ordenesService.js`, no en controladores ni en el frontend.
- **Rutas protegidas**: el frontend redirige a `/login` si no hay sesión activa; el backend rechaza con 401/403 independientemente del cliente.

---

## Limitaciones conocidas

- La clave secreta del JWT está hardcodeada en `authMiddleware.js`. En producción debería leerse de `process.env.JWT_SECRET`.
- No hay tests de frontend (solo backend con Jest + Supertest, según el enunciado).
