# Modelo de amenazas y controles de la PWA

## Alcance y supuestos

Este análisis cubre la PWA de inspecciones de mantenimiento de laboratorios, su almacenamiento IndexedDB, el service worker y el endpoint de sincronización `POST /api/inspections/sync`. Se usan fixtures y capturas sintéticas; la aplicación de demostración no es un sistema institucional de producción ni ofrece autenticación, autorización por usuario o un servidor persistente.

El escenario institucional de la actividad se analiza bajo el principio de protección de datos personales en posesión de sujetos obligados. Antes de usar datos reales, la institución debe confirmar base jurídica, aviso de privacidad, responsabilidades, retención y medidas aplicables con sus áreas competentes. Este documento no sustituye una evaluación jurídica ni una evaluación de impacto.

## Activos y límites de confianza

| Activo | Ubicación o flujo | Sensibilidad y objetivo |
| --- | --- | --- |
| Datos de inspección: ubicación del laboratorio, fecha, inspector, estado, hallazgos y resumen | Formulario, memoria de la aplicación e IndexedDB | Mantener integridad y limitar captura a la finalidad de mantenimiento; el inspector puede identificar a una persona en un despliegue real |
| Cola de sincronización, claves de idempotencia y revisiones | IndexedDB → endpoint de sincronización | Evitar duplicados, alteraciones y operaciones malformadas |
| Shell, manifest y recursos de aplicación | Next.js → service worker y Cache Storage | Mantener disponibilidad sin cachear respuestas API o privadas |
| Fixtures y evidencia de evaluación | Repositorio y CI | Solo datos sintéticos; evitar secretos y resultados que no correspondan al commit |
| Configuración y dependencias | Repositorio, instalación y CI | Evitar cambios no revisados y dependencias no declaradas |

El navegador, IndexedDB y el service worker son límites bajo control del cliente: el usuario puede inspeccionar o modificar el almacenamiento local. El endpoint de sincronización es otro límite: toda entrada recibida debe tratarse como no confiable aun cuando el cliente normal la genere.

## Actores y amenazas

| Actor o causa | Amenaza | Impacto | Controles y evidencia |
| --- | --- | --- | --- |
| Cliente manipulado o solicitud construida manualmente | Enviar JSON malformado, campos con tipos incorrectos o texto arbitrariamente largo | Errores de procesamiento, consumo de recursos o datos inválidos almacenados | `parseBoundedJsonRequest` limita el cuerpo a 16 KiB; `isSyncOperation` e `isInspection` validan forma, fechas, enteros y longitudes antes de aplicar la operación. `tests/security.spec.ts` comprueba JSON inválido, tamaño excesivo y campos fuera de límite. |
| Cliente manipulado | Reutilizar una clave de idempotencia con una operación distinta o una revisión obsoleta | Duplicación o pérdida de cambios | El flujo existente valida la operación y la política de sincronización mantiene idempotencia y conflictos; suite `tests/sync.spec.ts` y `tests/unit/queue-idempotency.spec.ts`. |
| Script ejecutado en el origen o XSS | Leer o alterar datos disponibles al cliente | Exposición o modificación de datos en IndexedDB | React escapa texto renderizado y el service worker no cachea `/api/`; CSP/headers y pruebas de regresión deben verificarse como parte de la integración de Semana 9. No se debe tratar IndexedDB como almacenamiento secreto. |
| Dispositivo perdido o navegador compartido | Acceso a datos locales persistidos | Exposición de datos de inspección y potencial identificación de personal | Usar solo datos sintéticos en esta entrega; limitar finalidad y campos. No hay cifrado local ni aislamiento por usuario implementado, por lo que el riesgo residual impide usar datos reales. |
| Red intermediaria o endpoint desplegado sin TLS | Lectura o alteración del tráfico | Divulgación o modificación de operaciones | Exigir HTTPS en despliegue y no enviar secretos; la configuración local de desarrollo no demuestra TLS de producción. |
| Error de configuración de caché offline | Servir una respuesta de API o datos de usuario desde Cache Storage | Exposición de respuestas obsoletas o privadas | El service worker excluye métodos distintos de GET, otros orígenes y rutas `/api/`; solo precarga el shell y assets estáticos. Ver `tests/service-worker.spec.ts` y `tests/offline.spec.ts`. |
| Cambio accidental o malicioso en dependencias, código o workflow | Introducir controles débiles o producir evidencia falsa | Fallos de seguridad o evaluación incongruente | Lockfile, revisión de cambios y CI en el commit evaluado; ejecutar `npm ci` y `make verify`. El workflow del estudiante es evidencia formativa, no autoridad única de calificación. |

## Controles implementados en esta rama

- Los textos de inspección recibidos por el esquema tienen límites máximos explícitos: id 128, ubicación e inspector 120 cada uno, estado visible 80, resumen 500 y clave de idempotencia 200 caracteres.
- El endpoint de sincronización lee el cuerpo en streaming y rechaza solicitudes mayores de 16 KiB con HTTP 413 antes de parsear JSON.
- JSON inválido devuelve HTTP 400; las operaciones con esquema inválido siguen devolviendo HTTP 400 y no se aplican.
- Los límites y el parser se prueban en `tests/security.spec.ts`; el test se ejecuta en `npm test`.
- Las políticas de acceso, CSP/headers de producción, HTTPS del despliegue y el inventario completo de finalidades requieren revisión e integración del equipo antes de afirmar que están satisfechos.

## Riesgos residuales y decisiones pendientes

- La demo no autentica ni autoriza usuarios. No exponer el endpoint sintético como un servicio de datos institucionales.
- IndexedDB es legible y modificable desde el mismo perfil del navegador. La aplicación no cifra el almacenamiento ni implementa expiración o borrado por usuario.
- HTTPS depende de la configuración del hosting y debe comprobarse en el entorno de despliegue.
- CSP debe ser compatible con los recursos de Next.js y probarse en producción; no se afirma aquí que exista una política efectiva hasta que se integre y valide.
- Los identificadores y datos de inspección de la actividad son sintéticos. Antes de un piloto real se requiere revisión institucional de finalidades, retención, acceso, aviso de privacidad y respuesta a incidentes.
