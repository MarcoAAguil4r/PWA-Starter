# PWA de inspecciones de laboratorio — proyecto del equipo

Comiencen por `START_HERE.md` y lean `ACTIVIDAD-01.md`. Este es un proyecto acumulativo: un repositorio privado por equipo durante el curso. La Semana 1 consiste en arrancar, documentar y explicar la verificación; no en implementar toda la PWA.

## Entorno

Node.js 20.19 o posterior compatible, npm 10 o posterior, Git y cuenta de GitHub. No se requiere Make. Registren aquí las versiones usadas (`node --version`, `npm --version`) y cualquier dificultad de entorno que encuentren.

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

Ejecuta comprobación de archivos, prueba proporcionada y build; genera `reports/verification.json`. El reporte contiene resultados técnicos y documentos para revisión, no una calificación automática. `make verify` es equivalente. `bash public-tests/check.sh` es un check opcional de estructura.

GitHub Actions ejecuta la misma verificación y permite descargar el artefacto `starter-week-01-evidence`. El reporte local se excluye de Git: adjúntenlo en Classroom o descarguen el del SHA entregado desde Actions.

### Semana 2: manifest, shell y pruebas

La entrega requiere Node.js 20.19 o posterior y npm 10 o posterior. Con el lockfile del repositorio, los comandos reproducibles son:

```bash
npm ci
npm run dev
npm test
npm run verify
# equivalente:
make verify
```

Como comprobación adicional de estructura puede ejecutarse `bash public-tests/check.sh` en un entorno que disponga de Bash. `npm test` ejecuta la prueba base y `tests/manifest.spec.mjs`: confirma los campos del manifest, los iconos públicos, los landmarks, la incorporación del shell desde el layout, la navegación, los estados de carga/error/vacío y regresiones negativas de `start_url`, `display` e iconos.

La interfaz sigue utilizando exclusivamente inspecciones sintéticas. El listado comunica carga mediante `role="status"`, error mediante `role="alert"` con un botón **Reintentar** funcional, y ausencia de registros con un texto explícito. El shell usa landmarks accesibles, navegación por teclado y foco visible, y responde a viewport móvil y de escritorio. Esta semana no implementa service worker, almacenamiento offline ni sincronización; el manifest permite describir la instalación, pero no proporciona esas capacidades por sí solo.

## Trabajo y entrega en equipo

Inviten a los integrantes y al docente al mismo repositorio privado. Cada persona registra su evidencia en una sección de `evidence/individual.md`. Todos entregan en Classroom el mismo SHA final y enlaces, identificando su sección. El formato exacto está en `ACTIVIDAD-01.md`; no se requiere un pull request adicional ni una copia por alumno.

## Estructura y límites

- `src/app/`: pantalla Next.js.
- `src/lib/data/`: inspecciones sintéticas.
- `docs/`: requisitos y decisión del equipo.
- `evidence/`: evidencia propia de cada integrante.
- `tests/`: prueba inicial proporcionada; no es una suite completa de comportamiento.

Registren aquí sus supuestos y limitaciones de ejecución. El starter todavía no implementa service worker, offline ni sincronización. No incluyan datos personales reales en el producto, archivos `.env` ni credenciales. La identificación de integrantes se conserva en el repositorio privado y Classroom.
