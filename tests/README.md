# Contrato de pruebas

Las pruebas son deterministas y usan respuestas, caché y datos sintéticos. `npm test` ejecuta los specs base, manifest, service worker, offline, rendering y sincronización.

Semana 3 añade:

- `tests/service-worker.spec.ts`: instalación y precache, rechazo ante precache incompleto, cache-first de un recurso estático, limpieza de cachés de versiones anteriores y `clients.claim()`.
- `tests/offline.spec.ts`: fallback 503 de un recurso estático, recuperación de una navegación desde runtime, recuperación de red con respuesta fresca y protección para no guardar una respuesta HTTP 500.

No hay dependencia `tsx` ni `ts-node`; Node 22.18+ ejecuta estos `.spec.ts` de forma nativa y también están integrados en `npm test`:

```bash
node tests/service-worker.spec.ts  # PASS
node tests/offline.spec.ts         # PASS
```

Node puede emitir una advertencia de tipo de módulo para ambos archivos, pero los ejecuta. `npm test`, `npm run verify` y el workflow de Semana 3 cubren estos dos specs. No hay prueba E2E de navegador para registro, espera/actualización del worker o la UI offline.

## Semana 5

`sync.spec.ts` valida el esquema y las transacciones IndexedDB con `fake-indexeddb`, el endpoint sintético, la cola y las decisiones de conflicto. Está integrado en `npm test`; también puede ejecutarse directamente:

```bash
node tests/sync.spec.ts
```

El endpoint se prueba además desde la UI en navegador. El servidor de prueba conserva su estado solo en memoria y no reemplaza un backend persistente de producción.

## Semana 8

`tests/unit/capture-validation.spec.ts` comprueba la validación compartida por el formulario: normalización de texto, campos requeridos, límites de longitud y hallazgos enteros seguros no negativos. Se ejecuta como parte de `npm test` o directamente:

```bash
node tests/unit/capture-validation.spec.ts
```

La prueba no sustituye los escenarios de persistencia offline, reconexión, sincronización ni permisos del dispositivo, que requieren pruebas de integración y E2E.

## E2E de Semana 8

`tests/e2e/inspection-workspace.spec.ts` ejecuta `/inspecciones` con Playwright. El primer caso usa IndexedDB real, conectividad del contexto y el service worker de un build de producción para demostrar guardar `pending`, recargar sin conexión y sincronizar una sola operación remota idempotente. El segundo reemplaza `getUserMedia` por `NotAllowedError`, comprueba el fallback y guarda sin fotografía. No requieren cámara ni permiso físico.

Ejecute `npm run test:e2e`; Edge instalado es el predeterminado y `E2E_BROWSER=chrome` selecciona Chrome. Para ejecución visual: `npx playwright test --headed` después del build. Los resultados HTML/JUnit y los diagnósticos de fallo se escriben en `playwright-report/` y `test-results/`, rutas ignoradas por Git. `npm run test:coverage` conserva JSON V8 de las pruebas Node y `coverage/v8/summary.json` enumera únicamente módulos bajo `src/` con sus registros de rango; no es cobertura de navegador ni un porcentaje global.
