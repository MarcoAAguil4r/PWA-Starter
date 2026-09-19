# Estrategia de caché — Semana 3

## Alcance y registro

El worker se registra desde `ServiceWorkerRegistration`, incorporado en el shell de la aplicación. `registerServiceWorker()` solo intenta registrarlo en producción, en navegador compatible y con alcance `/`; en desarrollo no se registra. Esta entrega usa datos sintéticos y no implementa captura local, cola de envíos ni sincronización de inspecciones.

## Nombres y versionado

- `CACHE_VERSION` tiene el valor manual `w03-v1`; de él derivan `pwa-precache-w03-v1` y `pwa-runtime-w03-v1`.
- Cambiar `CACHE_VERSION` crea ambos nombres nuevos. En `activate`, el worker elimina únicamente cachés cuyo nombre comience por `pwa-precache-` o `pwa-runtime-` y que no sean los dos nombres vigentes. Conserva las cachés ajenas y las dos cachés actuales.
- No hay versionado por hash ni invalidación individual de recursos: la actualización exige cambiar manualmente `CACHE_VERSION` cuando corresponda.

## Precache

Durante `install`, `cache.addAll()` descarga `/`, `/manifest.webmanifest`, `/icons/icon-192x192.png` y `/icons/icon-512x512.png` en el precache. Son los únicos recursos precacheados: la página raíz, el manifest y los iconos públicos.

Si cualquiera falla, la promesa de instalación se rechaza; la versión nueva no queda instalada/activada como una versión lista. Si ya había un worker activo, este conserva el control hasta que una instalación posterior tenga éxito. Si no lo había, no existe cobertura offline. La prueba `tests/service-worker.spec.ts` cubre la lista de precache y el rechazo de una instalación fallida.

## Runtime cache

Solo se interceptan solicitudes `GET` del mismo origen. No se interceptan `/api/`, métodos mutantes ni solicitudes de otro origen.

- Las navegaciones usan **network first**. Con red, la respuesta se entrega directamente y, solo si es `200`, de tipo `basic` y sin `Cache-Control: private` o `no-store`, se clona en el runtime cache. Una respuesta HTTP no cacheable, incluido un `500`, se entrega pero no se guarda.
- `/_next/static/`, cualquier ruta bajo `/icons/` y `/manifest.webmanifest` usan **cache first**. Primero se busca en cualquier caché; ante un acierto no hay red. Ante un fallo de caché se consulta la red y una respuesta válida se guarda en runtime.

`tests/service-worker.spec.ts` cubre el caso cache-first de un icono; `tests/offline.spec.ts` cubre una navegación recuperada desde runtime y que, tras volver la red, recibe y almacena una respuesta fresca. Ninguna prueba automatizada cubre todas las exclusiones de método, origen, API y cabeceras.

## Fallback offline

Para un recurso estático sin red ni caché, `cacheFirstStatic()` devuelve una página HTML con estado `503`, encabezado `X-Offline-Fallback: true` y el mensaje «Sin conexión. No hay una versión disponible para esta solicitud.» No se almacena esa respuesta.

Para una navegación sin red, el código busca primero la URL solicitada y después `/`. **Limitación conocida:** la segunda búsqueda se escribe como `cachedResponse || caches.match("/") || offlineFallback()` sin esperar (`await`) `caches.match("/")`. La promesa es truthy al evaluar `||`; si esa coincidencia también resuelve vacía, la navegación resuelve `undefined` en vez de llegar al HTML 503. Por tanto, no se puede prometer un fallback de navegación cuando ni la URL solicitada ni `/` están en caché. `tests/offline.spec.ts` reproduce este fallo y actualmente termina en error en ese caso.

La interfaz no muestra estado específico de conectividad ni ofrece sincronización. El fallback lo genera el worker; los estados existentes de la lista describen carga, error y vacío, no el estado de la red.

## Ciclo de vida y actualización

- Una versión nueva instala su precache antes de poder activar. Al instalar correctamente, sigue el ciclo de vida estándar: no se llama a `skipWaiting()` automáticamente, por lo que puede permanecer esperando mientras existan clientes controlados por la versión anterior.
- El worker escucha el mensaje `SKIP_WAITING` y entonces sí llama a `self.skipWaiting()`. No hay UI ni código de registro que envíe ese mensaje; no se afirma una actualización inmediata o automática.
- Al activar, limpia las versiones anteriores de sus dos familias de caché y ejecuta `clients.claim()`, con lo cual los clientes pasan a ser controlados por la versión activa. La limpieza ocurre después de una activación, no durante un intento de instalación fallido.
- `tests/service-worker.spec.ts` cubre limpieza de versiones propias, conservación de una caché ajena y `clients.claim()`. No hay prueba de navegador para el estado de espera ni para el mensaje `SKIP_WAITING`.

## Límites y riesgos

La estrategia no intercepta `/api/` ni peticiones no `GET`, y no guarda respuestas `private` o `no-store`; no implementa persistencia de formularios, credenciales ni sincronización posterior. Recuperar la conectividad solo permite que solicitudes futuras vuelvan a usar la red; no envía datos pendientes.

Riesgos reales:

- Una navegación puede mostrar una copia previa de runtime cuando la red falla; esa copia puede estar desactualizada.
- Los recursos de runtime no tienen límite de tamaño ni expiración; pueden crecer hasta que el navegador los evite o elimine.
- Si se cambia un recurso sin cambiar `CACHE_VERSION`, el precache conserva el nombre anterior; no existe invalidación por contenido.
- El fallo conocido del `await` puede dejar una navegación sin respuesta cuando tampoco existe `/` en caché.

La relación decisión → comportamiento → evidencia está en `tests/service-worker.spec.ts` (instalación, precache, cache-first, invalidación y activación), `tests/offline.spec.ts` (fallback estático, recuperación de navegación y protección ante respuesta no cacheable) y `evidence/individual.md`. Los dos specs no están integrados todavía en `npm test` ni en el paso efectivo de pruebas del workflow; es una limitación de integración, no evidencia de una suite completa.
