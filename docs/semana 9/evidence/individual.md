# Evidencia individual · semana 9

## Marco Antonio Aguilar Castillo — Integrante 1

- **Matrícula:** 3523110229.
- **Rama de trabajo:** `week9-marco`.
- **Commit SHA de implementación evaluado:** `6a29f3fe626291b3bcbc5d1c88c36eaa8069ae7e`. Este SHA contiene la implementación y las pruebas; el presente registro de evidencia se actualiza en el commit siguiente.
- **Contribución concreta:** elaboré [`docs/threat-model.md`](../../threat-model.md) para identificar activos, límites de confianza, actores, amenazas, controles implementados y riesgos residuales. Implementé [`src/lib/security/input-validation.ts`](../../../src/lib/security/input-validation.ts) con límites de texto y lectura de JSON acotada a 16 KiB; apliqué estos controles al esquema de inspecciones y al endpoint `POST /api/inspections/sync`. Añadí [`tests/security.spec.ts`](../../../tests/security.spec.ts) y lo incorporé al comando `npm test`.
- **Decisión técnica que puedo explicar:** validar la forma y longitud de cada campo no limita por sí solo el costo de leer un cuerpo HTTP grande. Por eso el endpoint consume el stream en fragmentos y rechaza el cuerpo tan pronto supera 16 KiB (HTTP 413), antes de parsearlo. Después valida la operación con el esquema compartido; JSON inválido y operaciones inválidas se rechazan con HTTP 400. La prueba separa entradas de texto válidas e inválidas, JSON malformado y cuerpo sobredimensionado.
- **Comandos ejecutados y resultados observados:**
  - `node tests/security.spec.ts` — PASS.
  - `npm test` — PASS; incluye la nueva prueba de seguridad y las suites existentes.
  - `npm run lint` — PASS.
  - `npm run typecheck` — PASS.
  - `npm run verify` — PASS; reportó `Verificación técnica: pass` y terminó con código 0. Incluyó pruebas, build, checks públicos de Semanas 5 y 6 y medición de renderizado.
  - `git diff --check` — PASS, sin errores de formato.
- **Qué demuestra la evidencia y qué no demuestra:** las pruebas confirman que el esquema admite la inspección sintética válida y rechaza campos vacíos o por encima del límite; además, el parser admite JSON válido, rechaza JSON inválido y detiene cuerpos superiores a 16 KiB. La suite y el build verifican que los cambios son compatibles con el resto del proyecto. No se ha probado el endpoint desplegado detrás de un proxy ni se demuestra autenticación, autorización, HTTPS de producción o una política CSP activa.
- **Limitación o riesgo pendiente:** IndexedDB puede ser leído y modificado por el usuario del navegador; no se implementaron cifrado local, aislamiento por usuario ni autenticación. La CSP y HTTPS dependen de configuración y validación de despliegue. Los entregables de otros frentes —`docs/privacy-data-inventory.md` y `public/robots.txt`— todavía no existen en esta rama, por lo que la aceptación completa de Semana 9 aún no puede darse por cerrada. Intenté ejecutar `bash "docs/semana 9/public-tests/check.sh"`, pero el entorno no tiene `/bin/bash`; esa prueba pública queda pendiente de ejecutarse en Git Bash o CI.
- **Cambio que puedo defender o modificar en vivo:** explicar y ajustar los límites de `SECURITY_INPUT_LIMITS`, el límite en bytes del parser, las respuestas HTTP del endpoint y las aserciones de [`tests/security.spec.ts`](../../../tests/security.spec.ts), demostrando con fixtures sintéticos qué entradas se aceptan y cuáles se rechazan.
- **Uso declarado de IA:** utilicé GitHub Copilot como apoyo para revisar el esquema y el endpoint existentes, implementar el control de entrada, preparar la prueba y estructurar esta evidencia. Revisé las modificaciones y validé personalmente las salidas de lint, typecheck, pruebas y verificación; los pendientes de integración y el fallo al invocar Bash se declaran explícitamente.
