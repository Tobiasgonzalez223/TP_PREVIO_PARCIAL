# TODO - Fase 2 (Sequelize/SQLite) — TP_PREVIO_PARCIAL

## Objetivo
Reemplazar la lógica actual de `backend/services/ordenesService.js` que usa `models/db.json` por una implementación 100% con Sequelize/SQLite, endureciendo validaciones, flujo de estados y persistencia de historial.

## Pasos
- [x] Paso 1: Reescribir `backend/services/ordenesService.js` para usar `Orden`, `Activo`, `HistorialOrden` (Sequelize).
- [ ] Paso 2: Implementar transiciones de estado válidas: `abierta → asignada → en_proceso → resuelta` y cancelación desde `abierta/asignada/en_proceso`.

- [ ] Paso 1b: No usar Sequelize en el entorno de tests por falla sqlite3 nativa (mantener db.json).


- [ ] Paso 3: Endurecer validaciones críticas:
  - [ ] Activo inexistente
  - [ ] Activo en `baja`
  - [ ] criticidad vs prioridad
  - [ ] resolver sin `tecnicoId`
  - [ ] no resolver canceladas
- [ ] Paso 4: Historial: registrar `valorAnterior/valorNuevo` correcto en cada acción/transición.
- [ ] Paso 5: Sincronizar `Activo.estado` al crear/asignar/resolver.
- [ ] Paso 6: Mantener compatibilidad con firma de controllers/rutas actuales.
- [ ] Paso 7: Ejecutar `cd backend && npm test` y corregir lo que falle.
- [ ] Paso 8: (Opcional) Ajustar `frontend` si algún response shape cambia.

