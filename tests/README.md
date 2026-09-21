# Contrato de pruebas

Las pruebas son deterministas y usan respuestas, caché y rutas sintéticas. `npm test` ejecuta `tests/starter.spec.mjs`, `tests/manifest.spec.mjs`, `tests/service-worker.spec.ts` y `tests/offline.spec.ts`.

Semana 3 añade:

- `tests/service-worker.spec.ts`: instalación y precache, rechazo ante precache incompleto, cache-first de un recurso estático, limpieza de cachés de versiones anteriores y `clients.claim()`.
- `tests/offline.spec.ts`: fallback 503 de un recurso estático, recuperación de una navegación desde runtime, recuperación de red con respuesta fresca y protección para no guardar una respuesta HTTP 500.

No hay dependencia `tsx` ni `ts-node`; Node 22.18+ ejecuta estos `.spec.ts` de forma nativa y también están integrados en `npm test`:

```bash
node tests/service-worker.spec.ts  # PASS
node tests/offline.spec.ts         # PASS
```

Node puede emitir una advertencia de tipo de módulo para ambos archivos, pero los ejecuta. `npm test`, `npm run verify` y el workflow de Semana 3 cubren estos dos specs. No hay prueba E2E de navegador para registro, espera/actualización del worker o la UI offline.

