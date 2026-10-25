# Estrategia de pruebas · Semana 8

## Diagnóstico inicial

Con Node.js `v22.22.0` y npm `10.9.4`, la ejecución inicial de `npm test` pasó en todas las suites existentes: starter, manifest, service worker, offline, rendering y sincronización. Node emitió avisos `MODULE_TYPELESS_PACKAGE_JSON` al ejecutar algunos specs TypeScript, pero terminó correctamente.

La aplicación de desarrollo inició en `http://localhost:3000`. La ruta `/inspecciones` respondió correctamente y mostró tres registros sintéticos, el formulario de captura y el estado «Registros locales cargados. La conexión está disponible». No se probó en este diagnóstico el flujo completo de captura offline y reconexión.

Se encontró un bloqueo preexistente fuera de la validación de captura: `/manifest.webmanifest` respondía HTTP 500 en desarrollo porque Next.js detectaba simultáneamente `public/manifest.webmanifest` y `src/app/manifest.ts` para la misma ruta. Se corrigió conservando la ruta generada por el App Router como fuente única y eliminando el espejo público; el service worker sigue precacheando esa misma URL. La prueba de manifest ahora evalúa el objeto producido por `manifest()` y los checks estructurales ya no requieren el archivo duplicado. Después del cambio, el manifest respondió HTTP 200 con su JSON y `/inspecciones` respondió HTTP 200 mostrando los registros y el formulario.

## Matriz riesgo–prueba

| Riesgo | Capa elegida | Comprobación y aserción útil | Estado en este frente |
| --- | --- | --- | --- |
| Captura inválida | Unitaria | `tests/unit/capture-validation.spec.ts` comprueba datos válidos, normalización, ubicación/responsable/resumen vacíos, longitudes máximas aceptadas (120/120/500) y excedidas, hallazgos negativos/no numéricos/fraccionarios/fuera del rango seguro. La misma función es consumida por el formulario. | Implementada |
| Persistencia y reconexión | Integración y E2E | `tests/e2e/inspection-workspace.spec.ts` guarda sin red, confirma `pending` y la operación IndexedDB, recarga la ruta sin red desde el caché del worker y, al reconectar, observa `synced` y cola vacía. | Implementada; requiere Edge o Chrome ya instalado para ejecutarse. |
| Duplicado de sincronización | Unitaria, integración y E2E | La regla de idempotencia deduplica una misma operación. El escenario E2E intercepta el transporte HTTP con un remoto sintético que conserva la operación por clave y confirma una sola entrada tras pulsar de nuevo sincronizar. | Implementada en las tres capas; el remoto E2E es un fixture de prueba, no un backend persistente. |
| Permiso de capacidad del dispositivo no disponible | E2E | El escenario E2E reemplaza `getUserMedia` con `NotAllowedError`, espera el fallback visible y guarda una captura sin fotografía. | Implementada; no depende de cámara ni permiso físico. |

Las pruebas unitarias hacen rápida y determinista la comprobación de reglas puras. La integración debe cubrir la frontera IndexedDB/cola/transporte, donde se originan persistencia e idempotencia reales. E2E se reserva para el comportamiento observable desde la interfaz, incluidas recarga, conectividad y fallback de capacidades; buscar nombres o textos en el código no demuestra esos flujos.

## Comandos y límites

```bash
npm ci
node tests/unit/capture-validation.spec.ts
npm test
npm run build
npm run dev
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e
```

`npm test` ejecuta todas las suites registradas, incluida la nueva prueba unitaria. `npm run build` verifica la compilación de producción y el chequeo TypeScript realizado por Next.js. `npm run dev` inicia la aplicación para inspección manual en `http://localhost:3000`; se detiene con Ctrl+C. `npm run lint` y `npm run typecheck` son puertas independientes. `npm run test:e2e` crea primero el build de producción porque el worker sólo se registra fuera de desarrollo; requiere Edge (predeterminado) o Chrome existentes y no descarga navegadores. Para observar los pasos en Edge se puede usar `npx playwright test --headed` después del build.

La prueba de validación comprueba la regla que usa el formulario, pero no prueba guardar en IndexedDB, recargar, sincronizar ni permisos de dispositivo. Esos resultados se cubren además por integración y E2E. La corrección del manifest cubre el conflicto de ruta con una prueba del objeto de configuración; la respuesta HTTP 200 se confirmó en desarrollo. `npm run test:coverage` conserva datos V8 reales de la suite Node en `coverage/v8/` y genera `summary.json` con registros de rangos ejecutados por módulos de `src/`; excluye pruebas, dependencias y navegador, por lo que no representa cobertura E2E ni declara porcentajes.

## Resultado verificado

`node tests/unit/capture-validation.spec.ts`, `npm test` y `npm run verify` terminaron con código 0. `npm run verify` reportó `Verificación técnica: pass`: suites, build de producción, check público de Semana 5, escaneo de secretos y medición SSR/CSR pasaron. El build comprobó tipos y generó `/manifest.webmanifest`. Node mostró avisos `MODULE_TYPELESS_PACKAGE_JSON` para specs TypeScript, sin fallar las pruebas. La verificación no equivale a CI de Semana 8 ni a completar los escenarios E2E pendientes.
