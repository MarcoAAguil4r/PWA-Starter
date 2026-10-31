# Inventario de datos y finalidades (Semana 9)

## Alcance y supuestos

Inventario de la PWA de inspecciones de laboratorios. **Solo datos sintéticos** de demostración y evaluación. No se tratan datos personales reales de personal universitario ni identificadores institucionales.

Finalidad general: registrar y sincronizar capturas de mantenimiento de laboratorios con fines académicos y de evaluación del producto.

No se incluye autenticación de usuarios ni servidor institucional de producción.

## Flujos y datos

| Flujo | Datos (sintéticos) | Finalidad | Persistencia | Retención / exposición | Control o límite |
| --- | --- | --- | --- | --- | --- |
| Formulario de captura | ubicación, fecha, inspector, hallazgos, resumen, estado | Crear registro de inspección | Memoria del cliente → IndexedDB | Mientras el usuario no borre el origen del sitio; legible en el mismo perfil del navegador | Validación de longitud y forma (`src/lib/security`, captura). Sin secretos en el payload. |
| Cola de sincronización | `idempotencyKey`, `inspectionId`, payload, revisiones, intentos | Reintentar envío sin duplicar | IndexedDB (`syncQueue`) | Hasta aplicar o descartar la operación | Idempotencia y límites de clave; no cachear en SW. |
| Endpoint `POST /api/inspections/sync` | Cuerpo JSON de la operación | Aplicar operación en servidor sintético | Memoria del proceso sintético (demo) | Sesión del proceso demo; no BD institucional | Cuerpo ≤ 16 KiB; JSON inválido → 400; exceso → 413. |
| Service worker / caché | Shell `/inspecciones`, estáticos, manifest, iconos | Disponibilidad offline del shell | Cache Storage | Hasta actualización del worker | No intercepta ni cachea `/api/` ni métodos no GET. |
| Cámara / geolocalización / notificaciones | Permisos del navegador; foto opcional en cliente | Enriquecer captura (opcional) | Foto solo si el usuario captura (cliente); no se inventan datos de localización real en fixtures | El usuario puede denegar; la captura sigue siendo posible sin foto | Fallbacks y pruebas de capacidades; sin exigir PII. |
| Evidencia y CI | SHA, reportes, fixtures sintéticos | Evaluación académica | Repo / artefactos CI | Según política del repositorio | Sin tokens ni PII. |

## Principios aplicados

1. **Minimización:** solo campos necesarios para la demo de inspección; no se piden CURP, correo institucional, teléfono ni credenciales.
2. **Finalidad limitada:** mantenimiento de laboratorios (sintético) y evaluación del curso; no marketing ni perfiles.
3. **Transparencia en demo:** el README y este inventario declaran que los datos son sintéticos y que IndexedDB no es almacenamiento secreto.
4. **Transporte:** en despliegue se exige HTTPS; el entorno local de desarrollo no sustituye TLS de producción.
5. **CSP / headers:** política razonable en despliegue (compatibilidad Next.js); si aún no hay headers fijos en el repo, se documenta como limitación y no se afirma cobertura completa hasta integrarla y probarla.

## Qué no se almacena

- Secretos, API keys o tokens de sesión reales.
- Datos personales reales de estudiantes o personal.
- Caché de respuestas de API de sincronización en el service worker.

## Limitaciones

- Sin cifrado at-rest en IndexedDB ni borrado automático por política de retención institucional.
- Sin aislamiento multi-usuario: un perfil de navegador ve todos los registros locales del origen.
- Antes de un piloto real con datos personales, la institución debe definir base jurídica, aviso de privacidad, retención y responsables.

## Relación con el modelo de amenazas

Este inventario se alinea con `docs/threat-model.md`: el cliente y IndexedDB son límites no confiables; el endpoint valida entrada; el SW no cachea API. Los riesgos residuales de dispositivo compartido y falta de auth siguen vigentes.