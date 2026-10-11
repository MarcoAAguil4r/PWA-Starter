
# Evidencia individual — Semana 6

## David Aguilar Rodríguez — Integrante 2

- **Matrícula:** 3522110617.
- **Rama:** `feature/week-6-notifications-ui`.
- **Commit SHA de implementación:** `c595a7292a7030ce59cc368bd340504d33808050`.
- **Responsabilidad:** cliente de notificaciones e integración de la interfaz de inspecciones.
- **Implementación:** `src/lib/notifications/client.ts` proporciona gestión tipada de permisos, emisión de notificaciones locales y fallback. `src/components/inspection-workspace.tsx` incorpora una acción explícita para habilitar notificaciones y avisos al guardar inspecciones.
- **Decisión técnica:** utilizar notificaciones locales del navegador con solicitud de permisos mediante una acción explícita, manteniendo mensajes visibles cuando no hay autorización.
- **Privacidad:** no se implementó Web Push remoto ni se incorporaron secretos, servicios externos o almacenamiento automático de imágenes y coordenadas.
- **Pruebas automatizadas:** `npm ci`, `npm test`, `npm run build` y `npm run verify`: PASS en ejecución local posterior a la instalación de dependencias.
- **Pruebas manuales:** notificación con permiso concedido: PASS. Permiso denegado y fallback visible: PASS. Guardado sin permiso: PASS. No se observaron errores de hidratación en la consola revisada.
- **Pruebas pendientes:** ausencia de API `Notification`, deduplicación específica y validación final de captura fotográfica.
- **Limitaciones:** la captura opcional de cámara todavía no se ha integrado en la interfaz. El PR de Marco ya está incorporado en `main`, pero falta completar y verificar la integración desde esta rama.
- **Incidencia ajena a la asignación:** conflicto de rutas en `/manifest.webmanifest` (HTTP 500), registrado en GitHub Issues para una corrección posterior.
- **Uso de IA:** Codex como apoyo para implementación y revisión; validación humana mediante revisión de cambios, verificaciones locales y pruebas manuales.
- **Cambio que puedo defender:** manejo de permisos, fallback y aislamiento de errores de notificaciones.

## Plantilla para evidencia de otros integrantes

- **Estudiante:**
- **Commit SHA evaluado:**
- **Decisión técnica que puedo explicar:**
- **Prueba que ejecuté y resultado:**
- **Limitación o fallo diagnosticado:**
- **Cambio que podría defender o modificar en vivo:**
- **Uso declarado de IA (herramienta, propósito, validación):**
