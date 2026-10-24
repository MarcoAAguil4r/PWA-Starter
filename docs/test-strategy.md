# Estrategia de pruebas · Semana 8

## Diagnóstico inicial

Con Node.js `v22.22.0` y npm `10.9.4`, la ejecución inicial de `npm test` pasó en todas las suites existentes: starter, manifest, service worker, offline, rendering y sincronización. Node emitió avisos `MODULE_TYPELESS_PACKAGE_JSON` al ejecutar algunos specs TypeScript, pero terminó correctamente.

La aplicación de desarrollo inició en `http://localhost:3000`. La ruta `/inspecciones` respondió correctamente y mostró tres registros sintéticos, el formulario de captura y el estado «Registros locales cargados. La conexión está disponible». No se probó en este diagnóstico el flujo completo de captura offline y reconexión.

Se encontró un bloqueo preexistente fuera de la validación de captura: `/manifest.webmanifest` respondía HTTP 500 en desarrollo porque Next.js detectaba simultáneamente `public/manifest.webmanifest` y `src/app/manifest.ts` para la misma ruta. Se corrigió conservando la ruta generada por el App Router como fuente única y eliminando el espejo público; el service worker sigue precacheando esa misma URL. La prueba de manifest ahora evalúa el objeto producido por `manifest()` y los checks estructurales ya no requieren el archivo duplicado. Después del cambio, el manifest respondió HTTP 200 con su JSON y `/inspecciones` respondió HTTP 200 mostrando los registros y el formulario.

## Matriz riesgo–prueba

| Riesgo | Capa elegida | Comprobación y aserción útil | Estado en este frente |
| --- | --- | --- | --- |
| Captura inválida | Unitaria | `tests/unit/capture-validation.spec.ts` comprueba datos válidos, normalización, ubicación/responsable/resumen vacíos, longitudes máximas aceptadas (120/120/500) y excedidas, hallazgos negativos/no numéricos/fraccionarios/fuera del rango seguro. La misma función es consumida por el formulario. | Implementada |
| Persistencia y reconexión | Integración y E2E | Guardar sin red debe conservar la inspección en IndexedDB después de recargar; al volver la red, debe cambiar a sincronizada. La prueba debe aislar IndexedDB y controlar la respuesta remota. | Pendiente de los frentes de integración/E2E |
| Duplicado de sincronización | Unitaria e integración | La regla de idempotencia debe deduplicar la misma operación; una integración debe reintentar contra una respuesta remota controlada y asertar una sola inspección. La prueba debe fallar al retirar temporalmente esa protección. | La suite previa de sincronización ya prueba la cola; la evidencia de integración y defecto controlado está pendiente |
| Permiso de capacidad del dispositivo no disponible | E2E | Simular permiso denegado o capacidad ausente desde la interfaz y comprobar que se puede guardar la captura sin depender del dispositivo del evaluador. | Pendiente del frente E2E |

Las pruebas unitarias hacen rápida y determinista la comprobación de reglas puras. La integración debe cubrir la frontera IndexedDB/cola/transporte, donde se originan persistencia e idempotencia reales. E2E se reserva para el comportamiento observable desde la interfaz, incluidas recarga, conectividad y fallback de capacidades; buscar nombres o textos en el código no demuestra esos flujos.

## Comandos y límites

```bash
npm ci
node tests/unit/capture-validation.spec.ts
npm test
npm run build
npm run dev
```

`npm test` ejecuta todas las suites registradas, incluida la nueva prueba unitaria. `npm run build` verifica la compilación de producción y el chequeo TypeScript realizado por Next.js. `npm run dev` inicia la aplicación para inspección manual en `http://localhost:3000`; se detiene con Ctrl+C. El proyecto todavía no declara un comando independiente de lint ni un flujo E2E de navegador en este frente. La configuración común de CI y los reportes de integración/E2E corresponden a los otros frentes; no se consideran completados por esta prueba unitaria.

La prueba de validación comprueba la regla que usa el formulario, pero no prueba guardar en IndexedDB, recargar, sincronizar ni permisos de dispositivo. Esos resultados requieren sus pruebas de integración/E2E. La corrección del manifest cubre el conflicto de ruta con una prueba del objeto de configuración; la respuesta HTTP 200 se confirmó en desarrollo.

## Resultado verificado

`node tests/unit/capture-validation.spec.ts`, `npm test` y `npm run verify` terminaron con código 0. `npm run verify` reportó `Verificación técnica: pass`: suites, build de producción, check público de Semana 5, escaneo de secretos y medición SSR/CSR pasaron. El build comprobó tipos y generó `/manifest.webmanifest`. Node mostró avisos `MODULE_TYPELESS_PACKAGE_JSON` para specs TypeScript, sin fallar las pruebas. La verificación no equivale a CI de Semana 8 ni a completar los escenarios E2E pendientes.
