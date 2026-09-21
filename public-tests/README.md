# Check público de estructura

Desde la raíz del proyecto: `bash public-tests/check.sh` o, sin Bash, `node scripts/verify.mjs --structure`. El script raíz valida la estructura de Semanas 1–3: manifest, shell, página, pruebas, service worker, registro, estrategia de caché, README y un patrón básico de secretos.

Para prueba y build usen `npm run verify`; produce `reports/verification.json`, ejecuta `npm test` y el build. La calidad del contenido se revisa con la rúbrica. Consulte `tests/README.md` para la cobertura y los límites de las pruebas de Semana 3.
