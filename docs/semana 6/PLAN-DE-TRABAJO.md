# Semana 6: organización y repartición de trabajo

## Revisión del alcance

La actividad continúa la PWA de inspecciones de las semanas anteriores. En una semana se deben integrar capacidades del dispositivo con permisos solicitados solo por acción del usuario, manejo de errores, privacidad y un flujo útil cuando la capacidad no esté disponible. La evidencia adjunta es opcional y los datos deben ser sintéticos; no se deben guardar coordenadas ni imágenes si no son necesarias para el flujo acordado.

Entregables verificables: cámara, geolocalización, cliente de notificaciones, documentación de capacidades, prueba de comportamiento, README actualizado y reporte reproducible. La rúbrica suma 8 puntos: AC-01 instalación/build (2), AC-02 implementación (3), AC-03 pruebas (2) y AC-04 evidencia/reporte (1). La carpeta `docs/semana 6/` conserva el contrato, la rúbrica, la plantilla de evidencia y los checks de referencia; los archivos de producto van en las rutas del mapa siguiente.

Al organizar esta semana, los módulos de cámara/geolocalización/notificaciones, `docs/capabilities.md` y `tests/capabilities.spec.ts` aún no están implementados. Esta preparación deja ubicaciones y responsabilidades, pero no crea archivos de código vacíos ni afirma que esos criterios ya estén aprobados.

### Mapa de archivos del producto

| Entregable | Ubicación en el repositorio |
| --- | --- |
| Adaptador de cámara | `src/lib/device/camera.ts` |
| Adaptador de geolocalización | `src/lib/device/geolocation.ts` |
| Cliente de notificaciones | `src/lib/notifications/client.ts` |
| Integración con el formulario de inspecciones | `src/components/inspection-workspace.tsx` |
| Decisiones, permisos, fallback y límites | `docs/capabilities.md` |
| Pruebas de capacidades | `tests/capabilities.spec.ts` |
| Instrucciones de uso del producto | `README.md` |
| Workflow que ejecuta GitHub Actions | `.github/workflows/week-06-w06-device-push.yml` |
| Evidencia individual de la actividad | `docs/semana 6/evidence/individual.md` y una sección por integrante en `evidence/individual.md` |

No crear archivos vacíos para satisfacer AC-02. La carpeta semanal contiene material de referencia, no reemplaza los módulos de producto bajo `src/`, las pruebas bajo `tests/` ni el workflow activo bajo `.github/workflows/`.

## Repartición para tres integrantes

Sustituyan “integrante 1/2/3” por sus nombres o iniciales al empezar. Cada rama debe contener cambios funcionales y explicables por su responsable.

| Integrante | Responsabilidad y archivos principales | Rama sugerida |
| --- | --- | --- |
| 1: Marco (3523110229) | Implementar los adaptadores de cámara y geolocalización, disponibilidad/errores de API, permisos mínimos y sus límites de privacidad. Acordar y comunicar sus contratos de exportación antes de que se integre la UI. | `semana-6/marco-3523110229-device` |
| 2 | Implementar `src/lib/notifications/client.ts` e integrar notificaciones y captura opcional de evidencia en `src/components/inspection-workspace.tsx`. Solicitar permisos solo desde una acción explícita y conservar un fallback utilizable. | `semana-6/integrante-2-notifications-ui` |
| 3 | Crear `tests/capabilities.spec.ts`, documentar decisiones y limitaciones en `docs/capabilities.md`, actualizar README e integrar el spec en `npm test` y en la verificación/CI. Revisar el contrato público y el reporte. | `semana-6/integrante-3-tests-docs` |

La integración de la UI depende de los contratos de los adaptadores. Acuerden primero sus entradas, resultados y errores; integren primero la rama del integrante 1 y actualicen después la rama del integrante 2 desde `main`. El integrante 3 coordina los mismos contratos para que las pruebas sean deterministas, sin cámara, GPS, notificaciones del sistema ni servicios reales.

Contrato de integración de Marco: `capturePhoto(options?)` en `src/lib/device/camera.ts` resuelve con un `Blob` JPEG (calidad predeterminada 0.85 y dimensión máxima 1280 px); detiene las pistas de cámara al terminar y no persiste ni sube la imagen. `getCurrentCoordinates(options?)` en `src/lib/device/geolocation.ts` resuelve solo `{ latitude, longitude, accuracy }` y no persiste la ubicación. Ambos rechazan con su error tipado y campo `code` para que la interfaz informe permisos denegados, capacidad ausente, cancelación o fallo sin depender de textos del navegador.

## Flujo de ramas

Cada persona crea su propia rama desde `main`, no trabaja directamente sobre `main` y no comparte una rama de trabajo. Comandos de Marco:

```bash
git switch main
git pull --ff-only origin main
git switch -c semana-6/marco-3523110229-device
```

Los demás usan el nombre de rama que les corresponde en la tabla. Después:

```bash
git add <archivos-de-su-tarea>
git commit -m "feat(week-6): describe el cambio"
git push -u origin <su-rama>
```

Abrir un pull request de cada rama hacia `main`, integrar en el orden de dependencias y resolver los conflictos en la rama propia. Antes de aprobar, ejecutar `npm test`, `npm run build` y el check público de Semana 6. Después de integrar todo, ejecutar `make verify`, registrar el SHA integrado y completar la evidencia individual de cada persona.

## Observaciones para cerrar durante la implementación

- El paquete fija el workflow activo en `.github/workflows/week-06-w06-device-push.yml`; GitHub no ejecuta un workflow que solo esté dentro de `docs/semana 6/.github/workflows/`. La copia incluida en el paquete se reubica en la ruta activa.
- Los entregables de Semana 6 todavía no forman parte de `npm test` ni del script raíz `scripts/verify.mjs`; el integrante 3 debe conectarlos para que la verificación acumulativa cubra esta semana.
- Ejecuta el check específico desde la raíz con `bash "docs/semana 6/public-tests/check.sh"`. El check genérico `bash public-tests/check.sh` no sustituye el contrato de Semana 6.
- El workflow de feedback aún no ejecuta `make verify` ni la comprobación AC-04; su lista de artefactos (`evaluation-result.json`, `coverage/`, `test-results/`) debe contrastarse con los archivos que realmente genere la implementación y la CI.
- El requisito habla de notificaciones push, pero sus entregables solo especifican un cliente de notificaciones y no describen suscripción Web Push, servidor emisor ni gestión de claves. La interpretación mínima de este reparto es una notificación local del navegador con fallback; confirmen con el docente si espera push remoto antes de ampliar alcance o introducir infraestructura/secrets.
