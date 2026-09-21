# PWA de inspecciones de laboratorio — proyecto del equipo

Comiencen por `START_HERE.md` y lean `ACTIVIDAD-01.md`. Este es un proyecto acumulativo: un repositorio privado por equipo durante el curso. Las indicaciones de Semana 1 se conservan como contexto histórico; la implementación actual también integra los artefactos de Semana 2 y Semana 3.

## Entorno

Node.js 22.18 o posterior, npm 10 o posterior, Git y cuenta de GitHub. Node 22.18+ permite ejecutar los specs TypeScript de Semana 3 sin agregar un runner. No se requiere Make. Registren aquí las versiones usadas (`node --version`, `npm --version`) y cualquier dificultad de entorno que encuentren.

## Ejecución

```bash
npm ci
npm run dev
```

Abran `http://localhost:3000` y comprueben las tres inspecciones sintéticas. Detengan el servidor con Ctrl+C.

## Verificación

```bash
npm run verify
```

Ejecuta la comprobación de estructura configurada, `npm test` y el build; genera `reports/verification.json`. El reporte contiene resultados técnicos y documentos para revisión, no una calificación automática. `make verify` es equivalente. `bash public-tests/check.sh` es un check opcional de estructura de Semanas 1–2.

El workflow de Semana 3 (`.github/workflows/week-03-w03-service-worker-offline.yml`) instala dependencias, compila, comprueba que existan los artefactos requeridos, ejecuta `npm test` y corre el check público. Su artefacto se llama `academic-evidence-w03-service-worker-offline`. El reporte local se excluye de Git: adjúntenlo en Classroom o descarguen el del SHA entregado desde Actions.

### Semana 2: manifest, shell y pruebas

La entrega requiere Node.js 22.18 o posterior y npm 10 o posterior. Con el lockfile del repositorio, los comandos reproducibles son:

```bash
npm ci
npm run dev
npm test
npm run verify
# equivalente:
make verify
```

Como comprobación adicional de estructura puede ejecutarse `bash public-tests/check.sh` en un entorno que disponga de Bash. `npm test` ejecuta la prueba base y `tests/manifest.spec.mjs`: confirma los campos del manifest, los iconos públicos, los landmarks, la incorporación del shell desde el layout, la navegación, los estados de carga/error/vacío y regresiones negativas de `start_url`, `display` e iconos.

La interfaz sigue utilizando exclusivamente inspecciones sintéticas. El listado comunica carga mediante `role="status"`, error mediante `role="alert"` con un botón **Reintentar** funcional, y ausencia de registros con un texto explícito. El shell usa landmarks accesibles, navegación por teclado y foco visible, y responde a viewport móvil y de escritorio. Al cierre de Semana 2 no existían service worker, almacenamiento offline ni sincronización; el manifest por sí solo no proporcionaba esas capacidades.

### Semana 3: service worker y consulta offline

En una compilación de producción, el shell registra `/sw.js` con alcance `/`. El worker precachea `/`, el manifest y los dos iconos; usa network-first para navegaciones y cache-first para recursos de Next, iconos y manifest. No intercepta API, solicitudes no `GET`, otros orígenes, ni implementa almacenamiento de formularios o sincronización de datos. Consulte [la estrategia de caché](docs/cache-strategy.md) para el detalle, riesgos y actualización.

Con un recurso estático no disponible, el worker entrega una página «Sin conexión» con estado 503. Una navegación puede recuperarse desde su copia cacheada o desde `/`; si ninguna está disponible, también recibe el fallback 503.

Los comandos configurados ejecutan la validación de Semanas 1, 2 y 3:

```bash
# Ejecuta las pruebas base, de manifest y los dos specs de Semana 3.
npm test

# También pueden ejecutarse de forma aislada:
node tests/service-worker.spec.ts
node tests/offline.spec.ts
```

En la verificación del 20 de septiembre de 2026, con Node v22.22.0 y npm 10.9.4, `npm ci`, `npm test`, `npm run build` y `make verify` terminaron correctamente. Los dos specs de Semana 3 pasaron y el reporte quedó en `reports/verification.json`. En Windows sin Bash, el check público puede sustituirse por `node scripts/verify.mjs --structure`; el workflow lo ejecuta con Bash en GitHub Actions.

## Trabajo y entrega en equipo

Inviten a los integrantes y al docente al mismo repositorio privado. Cada persona registra su evidencia en una sección de `evidence/individual.md`. Todos entregan en Classroom el mismo SHA final y enlaces, identificando su sección. El formato exacto está en `ACTIVIDAD-01.md`; no se requiere un pull request adicional ni una copia por alumno.

## Estructura y límites

- `src/app/`: pantalla Next.js.
- `src/lib/data/`: inspecciones sintéticas.
- `docs/`: requisitos y decisión del equipo.
- `evidence/`: evidencia propia de cada integrante.
- `tests/`: pruebas base, de manifest y los specs de comportamiento del worker de Semana 3.

Registren aquí sus supuestos y limitaciones de ejecución. La aplicación implementa una cobertura de recursos y navegación limitada mediante Service Worker, pero no captura ni sincroniza inspecciones offline. No incluyan datos personales reales en el producto, archivos `.env` ni credenciales. La identificación de integrantes se conserva en el repositorio privado y Classroom.
