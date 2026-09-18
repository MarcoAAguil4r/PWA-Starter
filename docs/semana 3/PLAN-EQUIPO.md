# Semana 3 — organización y reparto del equipo

## Diagnóstico de la carpeta

`docs/semana 3` es el paquete de referencia de la actividad `w03-service-worker-offline`. Describe el contrato académico, la rúbrica, los checks públicos, la plantilla de evidencia y el workflow de feedback. No contiene todavía la implementación del service worker ni las pruebas finales del proyecto.

La regla de organización es separar la documentación de referencia (`docs/`) de los archivos que las herramientas ejecutan desde la raíz del repositorio.

## Qué se conserva

| Ruta | Decisión | Motivo |
| --- | --- | --- |
| `ASSIGNMENT.md` | Conservar | Es la fuente de requisitos, entregables, criterios de aceptación y límites de la actividad. |
| `evaluation.json` | Conservar | Contiene el contrato estructurado de evaluación y los comandos esperados. |
| `README.md` | Conservar y enlazar este plan | Explica el origen del paquete y el comando público de referencia. |
| `evidence/individual.md` | Conservar como plantilla | Cada integrante necesita registrar su propia evidencia; la evidencia final se completa en `evidence/individual.md` de la raíz. |
| `public-tests/README.md` | Conservar como referencia | Documenta el propósito del check público, aunque el script ejecutable debe estar en la raíz. |
| `tests/README.md` | Conservar como contrato de pruebas | Orienta qué debe cubrir la suite de Semana 3. |

## Qué cambia de lugar

| Ruta actual | Destino de trabajo | Acción |
| --- | --- | --- |
| `docs/semana 3/.github/workflows/week-03-w03-service-worker-offline.yml` | `.github/workflows/week-03-w03-service-worker-offline.yml` | Mover cuando se integre el workflow. GitHub Actions solo descubre workflows en `.github/workflows` de la raíz. |
| `docs/semana 3/public-tests/check.sh` | `public-tests/check.sh` | Integrar con el check público existente de Semanas 1 y 2; no reemplazarlo sin conservar sus validaciones previas. |
| `docs/semana 3/public-tests/README.md` | `public-tests/README.md` | Fusionar las instrucciones de Semana 3 con las instrucciones ya existentes en la raíz. |
| `docs/semana 3/tests/README.md` | `tests/README.md` | Fusionar el contrato de pruebas con el README existente de la raíz. |

Los artefactos de entrega permanecen en la raíz, tal como los exige `ASSIGNMENT.md`: `public/sw.js`, `src/lib/pwa/register-service-worker.ts`, `docs/cache-strategy.md`, `tests/service-worker.spec.ts` y `tests/offline.spec.ts`.

## Qué se borra

Por ahora, nada. El paquete dentro de `docs/semana 3` sirve como respaldo auditable de la actividad y está sin seguimiento previo en Git. Después de integrar y validar los archivos en la raíz, se podrán eliminar únicamente las copias duplicadas de workflow, checks o plantillas que hayan sido trasladadas, siempre que el contrato original siga consultable y no se pierda ninguna instrucción.

No se deben borrar `ASSIGNMENT.md`, `evaluation.json` ni la evidencia individual: son necesarios para justificar decisiones y reproducibilidad.

## Reparto de tareas

### Integrante 1 — integración técnica y verificación final

1. Diseñar y justificar la estrategia de caché: precache, runtime cache, fallback y nombres/versionado de cachés.
2. Implementar `public/sw.js` con ciclo de vida seguro, recuperación ante fallos e invalidación controlada.
3. Integrar el registro en `src/lib/pwa/register-service-worker.ts` y conectarlo con el shell de Next.js sin bloquear la carga.
4. Coordinar la integración del workflow en `.github/workflows`, resolver conflictos entre cambios y revisar que no se cacheen datos sensibles.
5. Ejecutar `npm ci`, `npm test`, `npm run build`, `make verify` y el check público; consolidar el SHA y el reporte final.

**Entregables principales:** `public/sw.js`, `src/lib/pwa/register-service-worker.ts`, integración del workflow y verificación final.

### Integrante 2 — pruebas de comportamiento

1. Implementar `tests/service-worker.spec.ts` para instalación, precache, runtime cache, actualización e invalidación.
2. Implementar `tests/offline.spec.ts` para fallback offline, errores de red y recuperación sin datos corruptos.
3. Asegurar que las pruebas sean deterministas, usen datos sintéticos y fallen ante una regresión relevante.
4. Ejecutar la suite después de cada integración y documentar los resultados y límites de cobertura.

**Entregables principales:** `tests/service-worker.spec.ts` y `tests/offline.spec.ts`.

### Integrante 3 — documentación, UX offline y evidencia

1. Redactar `docs/cache-strategy.md` con decisiones, límites, riesgos, política de actualización y comportamiento ante fallos.
2. Revisar la experiencia visible cuando no hay red: mensajes de fallback, estados de error y ausencia de afirmaciones engañosas sobre sincronización.
3. Fusionar las instrucciones de Semana 3 en `README.md`, `public-tests/README.md` y `tests/README.md` sin duplicar comandos contradictorios.
4. Completar su sección de `evidence/individual.md` y revisar que los tres integrantes documenten contribución, prueba, limitación y uso de IA.

**Entregables principales:** `docs/cache-strategy.md`, documentación actualizada y evidencia individual.

## Orden de integración

1. Integrante 1 acuerda la estrategia y crea la base del service worker.
2. Integrante 2 agrega las pruebas contra ese contrato.
3. Integrante 3 documenta decisiones y revisa la experiencia offline.
4. Integrante 1 integra, ejecuta todos los quality gates y registra el resultado real.

La distribución da a Integrante 1 una carga ligeramente mayor por asumir la implementación central, la integración y la verificación, mientras que Integrantes 2 y 3 mantienen responsabilidades independientes y comprobables.

## Lista de aceptación del equipo

- [ ] Los artefactos de Semana 3 existen en las rutas de la raíz.
- [ ] El workflow está en `.github/workflows` de la raíz.
- [ ] El check público conserva las validaciones anteriores y agrega las nuevas.
- [ ] `npm ci` y `make verify` terminan correctamente.
- [ ] Las pruebas cubren instalación, caché, fallback, actualización y errores.
- [ ] La documentación enlaza cada decisión con una prueba o evidencia.
- [ ] Cada integrante completa su evidencia individual con resultados reales.
- [ ] No hay secretos, tokens, PII ni datos reales.
