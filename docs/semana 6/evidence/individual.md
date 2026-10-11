
# Evidencia individual — Semana 6

## David Aguilar Rodríguez — Integrante 2

- **Matrícula:** 3522110617.
- **Rama:** `feature/week-6-notifications-ui`.
- **Commit SHA de notificaciones:** `c595a7292a7030ce59cc368bd340504d33808050`.
- **Commit SHA de integración fotográfica:** PENDIENTE DE COMMIT.
- **Responsabilidad individual:** cliente de notificaciones e integración de captura fotográfica opcional en la interfaz de inspecciones.
- **Implementación de notificaciones:** `src/lib/notifications/client.ts` proporciona permisos tipados, notificaciones locales y fallback. En `src/components/inspection-workspace.tsx`, el permiso se solicita sólo mediante el botón explícito y se muestra un aviso al guardar; si el permiso se deniega o no está disponible, permanece un mensaje alternativo visible. No hay Web Push remoto ni servicios externos.
- **Implementación fotográfica:** `src/components/inspection-workspace.tsx` consume el adaptador de Marco `capturePhoto(options): Promise<Blob>`, `CameraCaptureError` y cancelación mediante `AbortSignal` de `src/lib/device/camera.ts`. La captura se inicia mediante acción explícita, usa `isCapturing` como estado reactivo, permite cancelar y descartar, presenta una vista previa temporal y usa un contador de versión para descartar resultados tardíos. La URL de objeto se libera al cambiar o limpiar el `Blob`.
- **Privacidad y decisión técnica:** la fotografía sólo existe temporalmente en memoria. No se adjunta a la inspección, no se almacena en IndexedDB, no se agrega a la cola y no se sincroniza. Tras confirmar el guardado local se libera la fotografía y su vista previa, mientras el registro sigue siendo plenamente funcional sin fotografía.
- **Pruebas automatizadas:** `npm test`, `npm run build`, `npm run verify` y `git diff --check`: PASS. El primer intento de build de la integración inicial falló con `EPERM` del entorno; el reintento terminó correctamente. Las advertencias `MODULE_TYPELESS_PACKAGE_JSON` no impidieron las pruebas.
- **Pruebas manuales en Brave:** PASS para solicitud explícita de cámara, permiso concedido y captura, vista previa, descarte, liberación de vista previa tras guardar, permiso denegado con fallback, guardado sin foto con cámara bloqueada, guardado offline con estado `pending`, recuperación y sincronización a `synced` con el transporte sintético, cancelación durante la solicitud de permiso, notificación local autorizada y fallback con notificaciones denegadas.
- **Pruebas pendientes:** simular ausencia completa de la API de cámara; desmontaje o navegación durante captura activa; comprobar adicionalmente que no aparece una fotografía tardía tras cerrar permisos; y validar ausencia de API de notificaciones y deduplicación.
- **Limitaciones e incidencia ajena:** la sincronización probada usa el transporte sintético existente, no un backend de producción. El conflicto previo de rutas de `/manifest.webmanifest` que produce HTTP 500 en desarrollo está registrado en GitHub Issues; no corresponde a cámara ni notificaciones.
- **Uso de IA:** utilicé Codex para implementar y revisar la integración, actualizar la evidencia y ejecutar verificaciones; validé manualmente los cambios, los resultados locales y las pruebas en Brave.
- **Cambio que puedo defender:** permisos y fallback de notificaciones; captura temporal cancelable, limpieza posterior al guardado y protección frente a resultados tardíos de cámara.

## Plantilla para evidencia de otros integrantes

- **Estudiante:**
- **Commit SHA evaluado:**
- **Decisión técnica que puedo explicar:**
- **Prueba que ejecuté y resultado:**
- **Limitación o fallo diagnosticado:**
- **Cambio que podría defender o modificar en vivo:**
- **Uso declarado de IA (herramienta, propósito, validación):**
