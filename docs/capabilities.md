# Capacidades del dispositivo y notificaciones (Semana 6)

## Alcance

Se integran tres capacidades opcionales en la PWA de inspecciones:

| Capacidad | Módulo | Contrato público |
| --- | --- | --- |
| Cámara | `src/lib/device/camera.ts` | `capturePhoto(options?) → Promise<Blob>` |
| Geolocalización | `src/lib/device/geolocation.ts` | `getCurrentCoordinates(options?) → Promise<{ latitude, longitude, accuracy }>` |
| Notificaciones locales | `src/lib/notifications/client.ts` | `getNotificationPermission`, `requestNotificationPermission`, `showLocalNotification` |

La UI de inspecciones (`src/components/inspection-workspace.tsx`) consume cámara y notificaciones. La fotografía es evidencia **opcional y temporal**: no se persiste en IndexedDB ni se sincroniza.

## Permisos

- Los permisos se solicitan **solo por acción explícita del usuario** (botón), nunca al cargar el módulo ni al montar el componente.
- Cámara: `getUserMedia` al pulsar captura.
- Notificaciones: `Notification.requestPermission()` al pulsar habilitar.
- Geolocalización: `getCurrentPosition` solo si la UI lo invoca (no se solicita de forma anticipada).

## Fallback

Si la API no existe, el permiso se deniega o la operación falla:

- Cámara: mensaje en UI; el formulario de inspección sigue siendo usable sin fotografía.
- Geolocalización: error tipado (`permission-denied`, `unsupported`, `timeout`, etc.); no se bloquea el guardado.
- Notificaciones: el aviso permanece visible en la propia aplicación (`role`/mensaje en pantalla). No hay dependencia de un servicio push remoto.

## Privacidad y límites

- La captura de cámara devuelve un `Blob` JPEG (calidad por defecto 0.85, dimensión máxima 1280 px). Las pistas de `MediaStream` se detienen al terminar o al cancelar.
- La foto vive solo en memoria; se libera la Object URL al descartar o tras guardar.
- La geolocalización expone únicamente `latitude`, `longitude` y `accuracy`. No se persisten coordenadas.
- No se implementa Web Push, suscripción a un servidor emisor ni gestión de claves VAPID. La interpretación mínima del entregable es **notificación local del navegador** con fallback en UI.
- Datos de inspección: únicamente sintéticos. No se suben secretos, tokens ni PII.

## Errores tipados

Ambos adaptadores de dispositivo rechazan con clases propias y un campo `code` estable (`unsupported`, `permission-denied`, `unavailable`, `aborted`, `invalid-options`, …) para que la UI no dependa de textos del navegador.

## Pruebas

`tests/capabilities.spec.ts` cubre de forma determinista (mocks, sin hardware real):

- Cámara: API ausente, opciones inválidas, permiso denegado, captura JPEG y liberación de pistas, abort.
- Geolocalización: API ausente, opciones inválidas, éxito con forma mínima, permiso denegado, abort.
- Notificaciones: API ausente, denegado, concedido (muestra notificación), solicitud desde `default`.

También existe `tests/camera-cancellation.spec.mjs` (cancelación durante permiso y durante codificación).

## Verificación

```bash
npm ci
npm test
npm run build
npm run verify
bash "docs/semana 6/public-tests/check.sh"
