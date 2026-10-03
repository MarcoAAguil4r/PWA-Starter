# PWA de inspecciones de laboratorio — proyecto del equipo

Comiencen por `START_HERE.md` y lean `ACTIVIDAD-01.md`. Este es un proyecto acumulativo: un repositorio privado por equipo durante el curso. Las indicaciones de Semana 1 se conservan como contexto histórico; la implementación actual integra las actividades de las semanas 2 a 5.

## Entorno

Node.js 22.18 o posterior, npm 10 o posterior, Git y cuenta de GitHub. Node 22.18+ ejecuta los specs TypeScript sin agregar un runner. No se requiere Make. Registren aquí las versiones usadas (`node --version`, `npm --version`) y cualquier dificultad de entorno que encuentren.

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

Ejecuta la comprobación de estructura, `npm test`, el build de producción y la medición HTTP repetible de las rutas SSR/CSR; genera `reports/verification.json` y `reports/rendering-metrics.json`. El reporte contiene resultados técnicos y documentos para revisión, no una calificación automática. `make verify` es equivalente. Para repetir únicamente la medición después de un build, ejecuta `npm run measure:rendering`.

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
- [Documentación del proyecto y actividades](docs/README.md).
- `evidence/`: evidencia propia de cada integrante.
- `tests/`: pruebas base, de manifest y los specs de comportamiento del worker de Semana 3.

La app captura inspecciones sintéticas en IndexedDB, encola cada captura en la misma transacción y sincroniza al recuperar red. El endpoint `/api/inspections/sync` es un servidor sintético en memoria para la actividad: valida revisiones e idempotency keys, pero no es almacenamiento persistente de producción ni comparte datos entre reinicios del servidor. No incluyan datos personales reales, archivos `.env` ni credenciales.

### Semana 4: listado SSR y detalle CSR

`/inspecciones` es el listado SSR: se compone en el servidor con las tres inspecciones sintéticas. `/inspecciones/inspection-001`, `/inspecciones/inspection-002` y `/inspecciones/inspection-003` son detalles CSR; muestran carga antes de resolver el identificador en cliente. `/inspecciones/id-inexistente` comunica que no existe el registro y ofrece volver al listado.

La suite completa incluye `tests/rendering.spec.ts`, que verifica el contrato de estas rutas, carga, error recuperable, contenido, inexistente y navegación sin requerir servicios externos. `make verify` también mide cinco respuestas HTTP por ruta después de una solicitud de calentamiento y genera los reportes:

```bash
npm ci
make verify
bash "docs/semana 4/public-tests/check.sh"
```

La medición registra bytes del HTML inicial y mediana de respuesta HTTP local; no equivale a LCP/TTI ni al tiempo de hidratación. La comparación de estrategias, método, evidencia y límites está en [docs/rendering-decision.md](docs/rendering-decision.md). El workflow `.github/workflows/week-04-w04-csr-ssr.yml` ejecuta `npm ci`, `npm run verify` y publica ambos reportes con Node 22.18.0.

### Semana 5: captura offline y sincronización idempotente

La pantalla `/inspecciones` conserva las capturas sintéticas en IndexedDB (`pwa-inspections`) y las recupera al volver a abrir la aplicación. El formulario valida ubicación, responsable, resumen y un número entero no negativo de hallazgos antes de guardar. Una captura siempre queda visible con uno de estos estados: `pending` (guardada localmente y pendiente), `synced` (confirmada) o `conflict` (se conservaron ambas versiones). Los errores recuperables de almacenamiento o transporte se anuncian con `role="alert"`; no se descarta silenciosamente una operación.

Al recuperar conectividad, el evento `online` procesa la cola; también puede usarse **Sincronizar pendientes**. Un cerrojo por pestaña evita ejecuciones simultáneas. Cada operación conserva su clave idempotente y se reintenta hasta cinco veces sólo ante errores recuperables; un error no recuperable se abandona de manera explícita. Las respuestas remotas obsoletas no modifican una edición local reciente. Si hay conflicto, se persisten y muestran las copias local y remota. Consulte la [política de sincronización](docs/sync-policy.md).

`createSyntheticTransport()` usa HTTP hacia `/api/inspections/sync`. El endpoint sintético permite probar un flujo cliente-servidor reproducible y compartir idempotencia entre pestañas durante la vida del proceso; su estado se pierde al reiniciar el servidor, por lo que no sustituye una API y base de datos de producción.

Para verificar Semana 5 en un entorno con Node 22.18+ y Bash:

```bash
npm ci
npm test
npm run build
npm run verify
# equivalente:
make verify
bash "docs/semana 5/public-tests/check.sh"
```

`npm test` incluye las regresiones anteriores y `tests/sync.spec.ts`: validación, persistencia representada por el store, captura pendiente, reintentos, límite, errores no recuperables, deduplicación, conflictos y respuestas fuera de orden. `.github/workflows/week-05-w05-sync-data.yml` ejecuta la misma verificación y publica los reportes generados.
