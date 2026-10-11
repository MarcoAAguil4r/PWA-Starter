# Evidencia individual — Semana 6

## David Aguilar Rodríguez

- **Rama:** `feature/week-6-notifications-ui`.
- **Commit SHA:** PENDIENTE — registrar SHA después del commit manual.
- **Responsabilidad:** cliente de notificaciones e integración de interfaz.
- **Implementado:** `src/lib/notifications/client.ts` expone estado, solicitud explícita de permiso y emisión local tipada con fallback. `src/components/inspection-workspace.tsx` incorpora el control explícito para habilitar avisos, comunica el estado al usuario y muestra un aviso local cuando se guarda una inspección. Las etiquetas de notificación se deduplican por inspección durante la sesión.
- **Permisos y privacidad:** no se invoca `Notification.requestPermission()` durante importación, renderizado ni carga. No hay Web Push, secretos, servicios externos, imágenes persistidas ni coordenadas.
- **Dependencias y límites:** la cámara de Marco no existe en esta rama, por lo que no se importó ni se simuló. La captura opcional queda pendiente de su integración corregida. Las pruebas y documentación de capacidades corresponden al Integrante 3.
- **Verificaciones reales:** `npm test` y `npm run verify` fallaron al no poder resolver `fake-indexeddb` desde una prueba existente; no se instalaron dependencias. `npm run build` falló por `EPERM` al crear `.next/static/chunks`. `git diff --check` pasó. PENDIENTE DE VERIFICACIÓN MANUAL: permiso concedido/denegado/default, API no disponible, fallback visible, notificación al guardar y ausencia de duplicados.
