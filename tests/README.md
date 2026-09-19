# Contrato de pruebas

Las pruebas son deterministas y usan respuestas, caché y rutas sintéticas. `tests/starter.spec.mjs` y `tests/manifest.spec.mjs` son las únicas pruebas incluidas por el script actual `npm test`.

Semana 3 añade:

- `tests/service-worker.spec.ts`: instalación y precache, rechazo ante precache incompleto, cache-first de un recurso estático, limpieza de cachés de versiones anteriores y `clients.claim()`.
- `tests/offline.spec.ts`: fallback 503 de un recurso estático, recuperación de una navegación desde runtime, recuperación de red con respuesta fresca y protección para no guardar una respuesta HTTP 500. Su último caso documenta el defecto real de navegación sin fallback y actualmente falla.

No hay dependencia `tsx` ni `ts-node`, ni script npm para estos `.spec.ts`. En la revisión se ejecutaron directamente con Node v24.19.0:

```bash
node tests/service-worker.spec.ts  # PASS observado
node tests/offline.spec.ts         # FAIL observado: navegación sin caché resuelve undefined
```

Node emitió una advertencia de tipo de módulo para ambos archivos, pero los ejecutó. No se afirma compatibilidad de ese modo directo para toda versión declarada por el proyecto; debe verificarse en el entorno de entrega. `npm test`, `npm run verify` y el workflow de Semana 3 no ejecutan estos dos comandos actualmente, aunque el workflow comprueba que los archivos existan. No hay prueba E2E de navegador para registro, espera/actualización del worker o la UI offline.

