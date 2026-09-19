# Check público de estructura

Desde la raíz del proyecto: `bash public-tests/check.sh` o, sin Bash, `node scripts/verify.mjs --structure`. El script raíz actual valida la estructura heredada de Semanas 1–2 (manifest, shell, página, una prueba de manifest, README y un patrón básico de secretos). No valida los artefactos ni el comportamiento de Semana 3.

La copia de referencia de Semana 3 en `docs/semana 3/public-tests/check.sh` exige además `public/sw.js`, `src/lib/pwa/register-service-worker.ts`, `docs/cache-strategy.md`, `tests/service-worker.spec.ts` y `tests/offline.spec.ts`; no está fusionada en el script ejecutable de esta carpeta. Es un hallazgo de integración: no se modificó el check ni los scripts desde esta responsabilidad.

Para prueba y build usen `npm run verify`; produce `reports/verification.json`, pero actualmente solo ejecuta el contenido de `npm test` y el build. La calidad del contenido se revisa con la rúbrica. Consulte `tests/README.md` para los resultados y límites de las pruebas de Semana 3.
